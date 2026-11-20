import { envVars } from "@/app/config/env";
import { SLOT_CONFIG } from "@/app/config/slot.config";
import { AppError } from "@/app/errorHelpers/AppError";
import { prisma } from "@/app/lib/prisma";
import type { TAuthPayload } from "@/app/utils/token";
import type { Prisma } from "@/generated/prisma/client";
import { Role, SlotStatus } from "@/generated/prisma/enums";
import httpStatus from "http-status";
import {
	activeAppointmentWhere,
	cancelActiveAppointments,
	finalizeCancellations,
} from "../appointment/appointment.helpers";
import type {
	TBlockSlotsPayload,
	TManageSlotQuery,
	TOpenSlotsPayload,
	TPublicSlotQuery,
	TUnblockSlotsPayload,
} from "./slot.interface";
import {
	addDaysToDate,
	buildSlots,
	clinicDateOf,
	clinicDayStartUtc,
	formatClinicTime,
	groupByClinicDate,
	hasOverlap,
} from "./slot.utils";

const TZ = envVars.CLINIC_TIME_ZONE;
const DAY_MS = 24 * 60 * 60 * 1000;

type TDateRange = { from: string; to: string };

const resolveDoctorId = async (authUser: TAuthPayload, doctorIdParam: string): Promise<string> => {
	if (authUser.role === Role.DOCTOR) {
		const own = await prisma.doctorProfile.findUnique({
			where: { userId: authUser.userId },
			select: { id: true },
		});
		if (!own) throw new AppError(httpStatus.NOT_FOUND, "Doctor profile not found");
		if (doctorIdParam !== "me" && doctorIdParam !== own.id) {
			throw new AppError(httpStatus.FORBIDDEN, "You can only manage your own slots");
		}
		return own.id;
	}

	if (doctorIdParam === "me") {
		throw new AppError(httpStatus.BAD_REQUEST, "'me' works only for doctors — use a doctor id");
	}

	const doctor = await prisma.doctorProfile.findFirst({
		where: { id: doctorIdParam, user: { isDeleted: false } },
		select: { id: true },
	});
	if (!doctor) throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");
	return doctor.id;
};

const toUtcRange = ({ from, to }: TDateRange, maxDays: number) => {
	const days = (Date.parse(to) - Date.parse(from)) / DAY_MS + 1;
	if (days > maxDays) {
		throw new AppError(httpStatus.BAD_REQUEST, `Date range can be at most ${maxDays} days`);
	}
	return { gte: clinicDayStartUtc(from, TZ), lt: clinicDayStartUtc(addDaysToDate(to, 1), TZ) };
};

const openSlots = async (authUser: TAuthPayload, doctorIdParam: string, payload: TOpenSlotsPayload) => {
	const doctorId = await resolveDoctorId(authUser, doctorIdParam);
	const now = new Date();
	const today = clinicDateOf(now, TZ);
	const lastDate = addDaysToDate(today, SLOT_CONFIG.openMaxDaysAhead);

	const pastDate = payload.dates.find((date) => date < today);
	if (pastDate) throw new AppError(httpStatus.BAD_REQUEST, `${pastDate} is in the past`);

	const tooFar = payload.dates.find((date) => date > lastDate);
	if (tooFar) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`Slots can be opened at most ${SLOT_CONFIG.openMaxDaysAhead} days ahead (until ${lastDate})`,
		);
	}

	const allSlots = payload.dates.flatMap((date) =>
		buildSlots({
			date,
			startTime: payload.startTime,
			endTime: payload.endTime,
			slotMinutes: payload.slotMinutes,
			breaks: payload.breaks,
			timeZone: TZ,
		}),
	);
	const futureSlots = allSlots.filter((slot) => slot.startAt > now);

	const [firstSlot] = futureSlots;
	const lastSlot = futureSlots.at(-1);
	if (!firstSlot || !lastSlot) {
		throw new AppError(httpStatus.BAD_REQUEST, "All selected times are in the past");
	}
	if (futureSlots.length > SLOT_CONFIG.maxSlotsPerRequest) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`This would create ${futureSlots.length} slots; the limit is ${SLOT_CONFIG.maxSlotsPerRequest} per request`,
		);
	}

	const created = await prisma.$transaction(async (tx) => {
		await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${doctorId}))`;

		const existing = await tx.doctorSlot.findMany({
			where: { doctorId, startAt: { lt: lastSlot.endAt }, endAt: { gt: firstSlot.startAt } },
			select: { startAt: true, endAt: true },
		});

		const conflicts = futureSlots.filter((slot) => existing.some((other) => hasOverlap(slot, other)));
		const [firstConflict] = conflicts;
		if (firstConflict) {
			throw new AppError(
				httpStatus.CONFLICT,
				`${conflicts.length} new slot(s) overlap existing slots — first at ${formatClinicTime(firstConflict.startAt, TZ)}`,
			);
		}

		const result = await tx.doctorSlot.createMany({
			data: futureSlots.map((slot) => ({ doctorId, ...slot, createdById: authUser.userId })),
		});
		return result.count;
	});

	return { created, skippedPast: allSlots.length - futureSlots.length };
};

const getPublicSlots = async (doctorId: string, query: TPublicSlotQuery) => {
	const doctor = await prisma.doctorProfile.findFirst({
		where: { id: doctorId, user: { isDeleted: false, isActive: true } },
		select: { id: true },
	});
	if (!doctor) throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");

	const now = new Date();
	const today = clinicDateOf(now, TZ);
	const lastBookableDate = addDaysToDate(today, SLOT_CONFIG.bookingWindowDays - 1);

	const from = query.from && query.from > today ? query.from : today;
	const to = query.to ?? lastBookableDate;

	if (from > lastBookableDate || to > lastBookableDate) {
		throw new AppError(httpStatus.BAD_REQUEST, `Booking is open until ${lastBookableDate}`);
	}
	if (from > to) {
		throw new AppError(httpStatus.BAD_REQUEST, "'from' must be on or before 'to'");
	}

	const range = toUtcRange({ from, to }, SLOT_CONFIG.bookingWindowDays);
	const earliest = new Date(now.getTime() + SLOT_CONFIG.minLeadMinutes * 60_000);

	const slots = await prisma.doctorSlot.findMany({
		where: {
			doctorId,
			AND: [
				{ startAt: range },
				{ startAt: { gte: earliest } },
				{ OR: [{ status: SlotStatus.BLOCKED }, { appointments: { none: activeAppointmentWhere(now) } }] },
			],
		},
		select: { id: true, startAt: true, endAt: true, status: true, blockReason: true },
		orderBy: { startAt: "asc" },
	});

	const items = slots.map(({ status, blockReason, ...slot }) =>
		status === SlotStatus.BLOCKED
			? { ...slot, status: "BLOCKED" as const, blockReason }
			: { ...slot, status: "AVAILABLE" as const },
	);

	return { from, to, days: groupByClinicDate(items, TZ) };
};

const getManageSlots = async (authUser: TAuthPayload, doctorIdParam: string, query: TManageSlotQuery) => {
	const doctorId = await resolveDoctorId(authUser, doctorIdParam);
	const range = toUtcRange(query, SLOT_CONFIG.manageMaxRangeDays);
	const now = new Date();

	const slots = await prisma.doctorSlot.findMany({
		where: { doctorId, startAt: range },
		select: {
			id: true,
			startAt: true,
			endAt: true,
			status: true,
			blockReason: true,
			blockedAt: true,
			appointments: {
				where: activeAppointmentWhere(now),
				select: { id: true, appointmentNumber: true, status: true, patient: { select: { fullName: true } } },
				take: 1,
			},
		},
		orderBy: { startAt: "asc" },
	});

	const items = slots.map(({ appointments, ...slot }) => {
		const [booking] = appointments;
		const state = slot.status === SlotStatus.BLOCKED ? "BLOCKED" : booking ? "BOOKED" : "OPEN";
		return { ...slot, state, booking: booking ?? null };
	});

	return groupByClinicDate(items, TZ);
};

const toTargetFilter = (payload: TBlockSlotsPayload): Prisma.DoctorSlotWhereInput => {
	if (payload.slotIds) return { id: { in: payload.slotIds } };
	if (payload.from && payload.to) return { startAt: { lt: payload.to }, endAt: { gt: payload.from } };
	throw new AppError(httpStatus.BAD_REQUEST, "Send either slotIds or a from–to range");
};

const blockSlots = async (authUser: TAuthPayload, doctorIdParam: string, payload: TBlockSlotsPayload) => {
	const doctorId = await resolveDoctorId(authUser, doctorIdParam);
	const target = toTargetFilter(payload);
	const now = new Date();

	const result = await prisma.$transaction(async (tx) => {
		const blocked = await tx.doctorSlot.updateManyAndReturn({
			where: { doctorId, status: SlotStatus.OPEN, AND: [{ startAt: { gt: now } }, target] },
			data: {
				status: SlotStatus.BLOCKED,
				blockReason: payload.reason,
				blockedAt: now,
				blockedById: authUser.userId,
			},
			select: { id: true },
		});

		if (blocked.length === 0) {
			throw new AppError(httpStatus.BAD_REQUEST, "No open future slots matched — they may be past or already blocked");
		}

		const cancelled = await cancelActiveAppointments(
			tx,
			{ slotId: { in: blocked.map((slot) => slot.id) } },
			{ reason: payload.reason, actorId: authUser.userId, now },
		);

		return { blocked: blocked.length, cancelled };
	});

	await finalizeCancellations(result.cancelled, payload.reason);

	return { blocked: result.blocked, cancelledAppointments: result.cancelled.length };
};

const unblockSlots = async (authUser: TAuthPayload, doctorIdParam: string, payload: TUnblockSlotsPayload) => {
	const doctorId = await resolveDoctorId(authUser, doctorIdParam);

	const result = await prisma.doctorSlot.updateMany({
		where: { doctorId, id: { in: payload.slotIds }, status: SlotStatus.BLOCKED, startAt: { gt: new Date() } },
		data: { status: SlotStatus.OPEN, blockReason: null, blockedAt: null, blockedById: null },
	});

	if (result.count === 0) {
		throw new AppError(httpStatus.BAD_REQUEST, "No blocked future slots matched");
	}
	return { unblocked: result.count };
};

const deleteSlot = async (authUser: TAuthPayload, doctorIdParam: string, slotId: string) => {
	const doctorId = await resolveDoctorId(authUser, doctorIdParam);

	const slot = await prisma.doctorSlot.findFirst({
		where: { id: slotId, doctorId },
		select: { id: true, startAt: true },
	});
	if (!slot) throw new AppError(httpStatus.NOT_FOUND, "Slot not found");
	if (slot.startAt <= new Date()) {
		throw new AppError(httpStatus.BAD_REQUEST, "Past slots can't be deleted");
	}

	const bookings = await prisma.appointment.count({ where: { slotId: slot.id } });
	if (bookings > 0) {
		throw new AppError(httpStatus.CONFLICT, "This slot has bookings — block it instead");
	}

	await prisma.doctorSlot.delete({ where: { id: slot.id } });
};

export const SlotService = {
	openSlots,
	getPublicSlots,
	getManageSlots,
	blockSlots,
	unblockSlots,
	deleteSlot,
};
