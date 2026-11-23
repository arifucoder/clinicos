import { APPOINTMENT_CONFIG } from "@/app/config/appointment.config";
import { envVars } from "@/app/config/env";
import { SLOT_CONFIG } from "@/app/config/slot.config";
import { AppError } from "@/app/errorHelpers/AppError";
import { prisma } from "@/app/lib/prisma";
import { buildListQuery, buildMeta } from "@/app/shared/query/queryBuilder";
import type { TAuthPayload } from "@/app/utils/token";
import { Prisma } from "@/generated/prisma/client";
import {
	AppointmentPaymentMode,
	AppointmentSource,
	AppointmentStatus,
	PaymentProvider,
	PaymentStatus,
	Role,
	SlotStatus,
} from "@/generated/prisma/enums";
import httpStatus from "http-status";
import { isProfileComplete } from "../patient/patient.service";
import { createCheckoutSession, expireCheckoutSession } from "../payment/payment.stripe";
import { addDaysToDate, clinicDateOf } from "../slot/slot.utils";
import {
	appointmentListConfig,
	appointmentSelect,
	myAppointmentListConfig,
	type TAppointmentRow,
	toAppointmentResponse,
} from "./appointment.constant";
import { emailAppointmentConfirmed, emailPaymentLink, sendSafely } from "./appointment.email";
import {
	activeAppointmentWhere,
	cancelActiveAppointments,
	CANCELLABLE_STATUSES,
	clinicDayRange,
	expireStaleHolds,
	finalizeCancellations,
	nextAppointmentNumber,
} from "./appointment.helpers";
import type {
	TBookAppointmentPayload,
	TCancelAppointmentPayload,
	TCancelMyAppointmentPayload,
	TDeskPaymentPayload,
	TPrescriptionPayload,
} from "./appointment.interface";

const TZ = envVars.CLINIC_TIME_ZONE;
const MINUTE_MS = 60_000;
const { currency } = APPOINTMENT_CONFIG;

const findOwnDoctorId = async (userId: string) => {
	const doctor = await prisma.doctorProfile.findUnique({ where: { userId }, select: { id: true } });
	if (!doctor) throw new AppError(httpStatus.NOT_FOUND, "Doctor profile not found");
	return doctor.id;
};

const findMyPatientId = async (userId: string) => {
	const patient = await prisma.patient.findFirst({
		where: { userId, user: { isDeleted: false } },
		select: { id: true },
	});
	if (!patient) throw new AppError(httpStatus.NOT_FOUND, "Patient profile not found");
	return patient.id;
};

const findAppointmentOrThrow = async (where: Prisma.AppointmentWhereInput): Promise<TAppointmentRow> => {
	const appointment = await prisma.appointment.findFirst({ where, select: appointmentSelect });
	if (!appointment) throw new AppError(httpStatus.NOT_FOUND, "Appointment not found");
	return appointment;
};

const lockAppointment = async (tx: Prisma.TransactionClient, id: string) => {
	await tx.$queryRaw`SELECT id FROM "appointments" WHERE id = ${id} FOR UPDATE`;
};

const assertCancellable = (status: AppointmentStatus) => {
	if (!CANCELLABLE_STATUSES.includes(status)) {
		throw new AppError(httpStatus.CONFLICT, `A ${status} appointment can't be cancelled`);
	}
};

const isPaid = (appointment: TAppointmentRow) =>
	appointment.payments.some((payment) => payment.status === PaymentStatus.SUCCEEDED);

const assertCheckInOpen = (startAt: Date, now: Date) => {
	const opensAt = new Date(startAt.getTime() - APPOINTMENT_CONFIG.checkInOpensMinutesBefore * MINUTE_MS);
	if (now < opensAt) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`Check-in opens ${APPOINTMENT_CONFIG.checkInOpensMinutesBefore / 60} hours before the appointment`,
		);
	}
};

const findDoctorAppointment = async (userId: string, id: string) => {
	const doctorId = await findOwnDoctorId(userId);
	const appointment = await findAppointmentOrThrow({ id });
	if (appointment.doctor.id !== doctorId) {
		throw new AppError(httpStatus.FORBIDDEN, "This appointment belongs to another doctor");
	}
	return appointment;
};

const rethrowBookingConflict = (error: unknown): never => {
	if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
		throw new AppError(httpStatus.CONFLICT, "This time was just booked — please pick another slot", { cause: error });
	}
	throw error;
};

const resolveBookingPatient = async (authUser: TAuthPayload, payload: TBookAppointmentPayload) => {
	if (authUser.role === Role.PATIENT) {
		if (payload.deskPaymentMethod) {
			throw new AppError(httpStatus.FORBIDDEN, "Only the front desk can record a desk payment");
		}

		const patient = await prisma.patient.findFirst({
			where: { userId: authUser.userId, user: { isDeleted: false } },
			select: { id: true, phone: true, dateOfBirth: true, gender: true },
		});
		if (!patient) throw new AppError(httpStatus.NOT_FOUND, "Patient profile not found");
		if (!isProfileComplete(patient)) {
			throw new AppError(httpStatus.BAD_REQUEST, "Complete your profile first");
		}

		return { patientId: patient.id, source: AppointmentSource.ONLINE };
	}

	if (!payload.patientId) {
		throw new AppError(httpStatus.BAD_REQUEST, "patientId is required when booking for a patient");
	}

	const patient = await prisma.patient.findFirst({
		where: { id: payload.patientId, user: { isDeleted: false, isActive: true } },
		select: { id: true },
	});
	if (!patient) throw new AppError(httpStatus.NOT_FOUND, "Patient not found");

	return { patientId: patient.id, source: AppointmentSource.STAFF };
};

const lockSlot = async (tx: Prisma.TransactionClient, slotId: string) => {
	const locked = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "doctor_slots" WHERE id = ${slotId} FOR UPDATE`;
	if (locked.length === 0) throw new AppError(httpStatus.NOT_FOUND, "Slot not found");

	return tx.doctorSlot.findUniqueOrThrow({
		where: { id: slotId },
		select: {
			id: true,
			doctorId: true,
			startAt: true,
			endAt: true,
			status: true,
			blockReason: true,
			doctor: {
				select: {
					consultationFeeCents: true,
					isPaused: true,
					user: { select: { isActive: true, isDeleted: true } },
				},
			},
		},
	});
};

type TLockedSlot = Awaited<ReturnType<typeof lockSlot>>;

const assertSlotBookable = (slot: TLockedSlot, isStaff: boolean, now: Date) => {
	if (!slot.doctor.user.isActive || slot.doctor.user.isDeleted) {
		throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");
	}
	if (slot.status === SlotStatus.BLOCKED) {
		throw new AppError(httpStatus.CONFLICT, `This time is not available: ${slot.blockReason ?? "blocked"}`);
	}

	const today = clinicDateOf(now, TZ);

	if (isStaff) {
		if (slot.endAt <= now) throw new AppError(httpStatus.BAD_REQUEST, "This slot has already ended");
	} else {
		const earliest = new Date(now.getTime() + SLOT_CONFIG.minLeadMinutes * MINUTE_MS);
		if (slot.startAt < earliest) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				`Online bookings must be at least ${SLOT_CONFIG.minLeadMinutes} minutes ahead`,
			);
		}
		const lastBookableDate = addDaysToDate(today, SLOT_CONFIG.bookingWindowDays - 1);
		if (clinicDateOf(slot.startAt, TZ) > lastBookableDate) {
			throw new AppError(httpStatus.BAD_REQUEST, `Booking is open until ${lastBookableDate}`);
		}
	}

	if (slot.doctor.isPaused && clinicDateOf(slot.startAt, TZ) === today) {
		throw new AppError(httpStatus.CONFLICT, "This doctor is not taking new bookings today");
	}
};

const openCheckout = async (appointment: TAppointmentRow, paymentId: string) => {
	try {
		const session = await createCheckoutSession({
			appointmentId: appointment.id,
			paymentId,
			appointmentNumber: appointment.appointmentNumber,
			doctorName: appointment.doctor.user.name,
			amountCents: appointment.feeCents,
			currency,
			customerEmail: appointment.patient.user.email,
		});
		await prisma.payment.update({ where: { id: paymentId }, data: { stripeSessionId: session.sessionId } });
		return session.url;
	} catch (error) {
		await prisma.payment.updateMany({
			where: { id: paymentId, status: PaymentStatus.PENDING },
			data: { status: PaymentStatus.FAILED },
		});
		throw new AppError(httpStatus.BAD_GATEWAY, "Online payment is unavailable right now — please try again", {
			cause: error,
		});
	}
};

const bookAppointment = async (authUser: TAuthPayload, payload: TBookAppointmentPayload) => {
	const { patientId, source } = await resolveBookingPatient(authUser, payload);
	const isStaff = source === AppointmentSource.STAFF;
	const isOnline = payload.paymentMode === AppointmentPaymentMode.ONLINE;
	const checkInNow = payload.checkInNow === true;
	const now = new Date();

	const created = await prisma
		.$transaction(async (tx) => {
			const slot = await lockSlot(tx, payload.slotId);
			assertSlotBookable(slot, isStaff, now);
			if (checkInNow) assertCheckInOpen(slot.startAt, now);

			const feeCents = slot.doctor.consultationFeeCents;
			if (isOnline && feeCents < APPOINTMENT_CONFIG.minOnlineAmountCents) {
				throw new AppError(httpStatus.BAD_REQUEST, "This fee is too small for online payment — pay at the front desk");
			}

			const stale = await expireStaleHolds(tx, { slotId: slot.id }, now);

			const taken = await tx.appointment.findFirst({
				where: { slotId: slot.id, ...activeAppointmentWhere(now) },
				select: { id: true },
			});
			if (taken) throw new AppError(httpStatus.CONFLICT, "This time was just booked — please pick another slot");

			const sameDay = await tx.appointment.findFirst({
				where: {
					patientId,
					doctorId: slot.doctorId,
					startAt: clinicDayRange(clinicDateOf(slot.startAt, TZ)),
					...activeAppointmentWhere(now),
				},
				select: { appointmentNumber: true },
			});
			if (sameDay) {
				throw new AppError(
					httpStatus.CONFLICT,
					`This patient already has ${sameDay.appointmentNumber} with this doctor on the same day`,
				);
			}

			const appointment = await tx.appointment.create({
				data: {
					appointmentNumber: await nextAppointmentNumber(tx, now),
					patientId,
					doctorId: slot.doctorId,
					slotId: slot.id,
					startAt: slot.startAt,
					endAt: slot.endAt,
					status: isOnline
						? AppointmentStatus.PENDING_PAYMENT
						: checkInNow
							? AppointmentStatus.CHECKED_IN
							: AppointmentStatus.CONFIRMED,
					source,
					paymentMode: payload.paymentMode,
					feeCents,
					holdExpiresAt: isOnline ? new Date(now.getTime() + APPOINTMENT_CONFIG.holdMinutes * MINUTE_MS) : null,
					reason: payload.reason ?? null,
					bookedById: authUser.userId,
					checkedInAt: checkInNow ? now : null,
					checkedInById: checkInNow ? authUser.userId : null,
				},
				select: { id: true },
			});

			let paymentId: string | null = null;

			if (isOnline) {
				const payment = await tx.payment.create({
					data: { appointmentId: appointment.id, provider: PaymentProvider.STRIPE, amountCents: feeCents, currency },
					select: { id: true },
				});
				paymentId = payment.id;
			} else if (payload.deskPaymentMethod) {
				await tx.payment.create({
					data: {
						appointmentId: appointment.id,
						provider: PaymentProvider.DESK,
						status: PaymentStatus.SUCCEEDED,
						deskMethod: payload.deskPaymentMethod,
						receivedById: authUser.userId,
						amountCents: feeCents,
						currency,
						paidAt: now,
					},
				});
			}

			return { appointmentId: appointment.id, paymentId, staleSessionIds: stale.sessionIds };
		})
		.catch(rethrowBookingConflict);

	await Promise.all(created.staleSessionIds.map(expireCheckoutSession));

	const appointment = await findAppointmentOrThrow({ id: created.appointmentId });

	if (!created.paymentId) {
		const paymentLabel = payload.deskPaymentMethod
			? "Paid at the front desk"
			: "Pay at the front desk before your visit";
		await sendSafely(`confirm ${appointment.appointmentNumber}`, () =>
			emailAppointmentConfirmed(appointment, paymentLabel),
		);
		return { appointment: toAppointmentResponse(appointment), checkoutUrl: null };
	}

	let checkoutUrl: string;
	try {
		checkoutUrl = await openCheckout(appointment, created.paymentId);
	} catch (error) {
		await prisma.appointment.updateMany({
			where: { id: appointment.id, status: AppointmentStatus.PENDING_PAYMENT },
			data: { status: AppointmentStatus.EXPIRED },
		});
		throw error;
	}

	if (isStaff && appointment.holdExpiresAt) {
		const expiresAt = appointment.holdExpiresAt;
		await sendSafely(`payment link ${appointment.appointmentNumber}`, () =>
			emailPaymentLink(appointment, checkoutUrl, currency, expiresAt),
		);
	}

	return { appointment: toAppointmentResponse(appointment), checkoutUrl };
};

const getAppointments = async (authUser: TAuthPayload, rawQuery: unknown, date?: string) => {
	const conditions: Prisma.AppointmentWhereInput[] = [];
	if (authUser.role === Role.DOCTOR) conditions.push({ doctorId: await findOwnDoctorId(authUser.userId) });
	if (date) conditions.push({ startAt: clinicDayRange(date) });

	const q = buildListQuery(rawQuery, appointmentListConfig, conditions.length > 0 ? { AND: conditions } : undefined);

	const [rows, total] = await Promise.all([
		prisma.appointment.findMany({ ...q.args, select: appointmentSelect }),
		prisma.appointment.count({ where: q.where }),
	]);

	return { meta: buildMeta(total, q.page, q.limit), data: rows.map(toAppointmentResponse) };
};

const getAppointmentById = async (authUser: TAuthPayload, id: string) => {
	const scope = authUser.role === Role.DOCTOR ? { doctorId: await findOwnDoctorId(authUser.userId) } : {};
	return toAppointmentResponse(await findAppointmentOrThrow({ id, ...scope }));
};

const getMyAppointments = async (userId: string, rawQuery: unknown, range: { from?: string; to?: string } = {}) => {
	const patientId = await findMyPatientId(userId);
	const conditions: Prisma.AppointmentWhereInput[] = [{ patientId }];
	const startAt: { gte?: Date; lt?: Date } = {};
	if (range.from) startAt.gte = clinicDayRange(range.from).gte;
	if (range.to) startAt.lt = clinicDayRange(range.to).lt;
	if (range.from || range.to) conditions.push({ startAt });
	const q = buildListQuery(rawQuery, myAppointmentListConfig, { AND: conditions });

	const [rows, total] = await Promise.all([
		prisma.appointment.findMany({ ...q.args, select: appointmentSelect }),
		prisma.appointment.count({ where: q.where }),
	]);

	return { meta: buildMeta(total, q.page, q.limit), data: rows.map(toAppointmentResponse) };
};

const getMyAppointmentPeriods = async (userId: string, statuses?: AppointmentStatus[]) => {
	const patientId = await findMyPatientId(userId);
	const rows = await prisma.appointment.findMany({
		where: { patientId, ...(statuses && { status: { in: statuses } }) },
		select: { startAt: true },
	});

	const byYear = new Map<number, Set<number>>();
	for (const { startAt } of rows) {
		const day = clinicDateOf(startAt, TZ); // "YYYY-MM-DD"
		const year = Number(day.slice(0, 4));
		const month = Number(day.slice(5, 7));
		const months = byYear.get(year) ?? new Set<number>();
		months.add(month);
		byYear.set(year, months);
	}

	return [...byYear.entries()]
		.sort(([a], [b]) => b - a)
		.map(([year, months]) => ({ year, months: [...months].sort((a, b) => b - a) }));
};

const getMyAppointmentById = async (userId: string, id: string) => {
	const patientId = await findMyPatientId(userId);
	return toAppointmentResponse(await findAppointmentOrThrow({ id, patientId }));
};

const checkInAppointment = async (authUser: TAuthPayload, id: string) => {
	const appointment = await findAppointmentOrThrow({ id });

	if (appointment.status !== AppointmentStatus.CONFIRMED) {
		throw new AppError(
			httpStatus.CONFLICT,
			`Only a confirmed appointment can be checked in (this one is ${appointment.status})`,
		);
	}
	if (!isPaid(appointment)) {
		throw new AppError(httpStatus.CONFLICT, "Collect the consultation fee first");
	}

	const now = new Date();
	assertCheckInOpen(appointment.startAt, now);

	const { count } = await prisma.appointment.updateMany({
		where: { id, status: AppointmentStatus.CONFIRMED },
		data: { status: AppointmentStatus.CHECKED_IN, checkedInAt: now, checkedInById: authUser.userId },
	});
	if (count === 0) {
		throw new AppError(httpStatus.CONFLICT, "This appointment was just changed — refresh and try again");
	}

	return toAppointmentResponse(await findAppointmentOrThrow({ id }));
};

const completeAppointment = async (authUser: TAuthPayload, id: string) => {
	const appointment = await findDoctorAppointment(authUser.userId, id);

	if (appointment.status !== AppointmentStatus.CHECKED_IN) {
		throw new AppError(httpStatus.CONFLICT, "Only a checked-in appointment can be completed");
	}

	const { count } = await prisma.appointment.updateMany({
		where: { id, status: AppointmentStatus.CHECKED_IN },
		data: { status: AppointmentStatus.COMPLETED, completedAt: new Date() },
	});
	if (count === 0) {
		throw new AppError(httpStatus.CONFLICT, "This appointment was just changed — refresh and try again");
	}

	return toAppointmentResponse(await findAppointmentOrThrow({ id }));
};

const savePrescription = async (authUser: TAuthPayload, id: string, payload: TPrescriptionPayload) => {
	const appointment = await findDoctorAppointment(authUser.userId, id);

	const canWrite =
		appointment.status === AppointmentStatus.CHECKED_IN || appointment.status === AppointmentStatus.COMPLETED;
	if (!canWrite) {
		throw new AppError(httpStatus.CONFLICT, "A prescription can be written only after check-in");
	}

	const fields = {
		symptoms: payload.symptoms ?? null,
		diagnosis: payload.diagnosis ?? null,
		advice: payload.advice ?? null,
		followUpDate: payload.followUpDate ? new Date(payload.followUpDate) : null,
	};

	await prisma.$transaction(async (tx) => {
		const prescription = await tx.prescription.upsert({
			where: { appointmentId: id },
			create: { appointmentId: id, ...fields },
			update: fields,
			select: { id: true },
		});

		await tx.prescriptionItem.deleteMany({ where: { prescriptionId: prescription.id } });

		if (payload.items.length > 0) {
			await tx.prescriptionItem.createMany({
				data: payload.items.map((item, index) => ({
					prescriptionId: prescription.id,
					medicineName: item.medicineName,
					dosage: item.dosage,
					frequency: item.frequency,
					durationDays: item.durationDays ?? null,
					instructions: item.instructions ?? null,
					sortOrder: index,
				})),
			});
		}
	});

	return toAppointmentResponse(await findAppointmentOrThrow({ id }));
};

const markNoShow = async (id: string) => {
	const appointment = await findAppointmentOrThrow({ id });

	if (appointment.status !== AppointmentStatus.CONFIRMED) {
		throw new AppError(
			httpStatus.CONFLICT,
			`Only a confirmed appointment can be marked as no-show (this one is ${appointment.status})`,
		);
	}

	const allowedAt = new Date(appointment.startAt.getTime() + APPOINTMENT_CONFIG.noShowAfterMinutes * MINUTE_MS);
	if (new Date() < allowedAt) {
		throw new AppError(
			httpStatus.CONFLICT,
			`No-show can be marked ${APPOINTMENT_CONFIG.noShowAfterMinutes} minutes after the start time`,
		);
	}

	const { count } = await prisma.appointment.updateMany({
		where: { id, status: AppointmentStatus.CONFIRMED },
		data: { status: AppointmentStatus.NO_SHOW },
	});
	if (count === 0) {
		throw new AppError(httpStatus.CONFLICT, "This appointment was just changed — refresh and try again");
	}

	return toAppointmentResponse(await findAppointmentOrThrow({ id }));
};

const cancelAppointment = async (authUser: TAuthPayload, id: string, { reason }: TCancelAppointmentPayload) => {
	const current = await findAppointmentOrThrow({ id });
	assertCancellable(current.status);

	const cancelled = await prisma.$transaction((tx) =>
		cancelActiveAppointments(tx, { id }, { reason, actorId: authUser.userId, now: new Date() }),
	);
	if (cancelled.length === 0) {
		throw new AppError(httpStatus.CONFLICT, "This appointment was just changed — refresh and try again");
	}

	await finalizeCancellations(cancelled, reason);
	return toAppointmentResponse(await findAppointmentOrThrow({ id }));
};

const cancelMyAppointment = async (userId: string, id: string, payload: TCancelMyAppointmentPayload) => {
	const patientId = await findMyPatientId(userId);
	const current = await findAppointmentOrThrow({ id, patientId });
	assertCancellable(current.status);

	const now = new Date();
	const minutesLeft = (current.startAt.getTime() - now.getTime()) / MINUTE_MS;
	if (minutesLeft < APPOINTMENT_CONFIG.patientCancelBeforeMinutes) {
		throw new AppError(
			httpStatus.CONFLICT,
			`Online cancellation closes ${APPOINTMENT_CONFIG.patientCancelBeforeMinutes / 60} hours before the appointment — please call the front desk`,
		);
	}

	const paidAtDesk = current.payments.some(
		(payment) => payment.provider === PaymentProvider.DESK && payment.status === PaymentStatus.SUCCEEDED,
	);
	if (paidAtDesk) {
		throw new AppError(httpStatus.CONFLICT, "You paid at the front desk — please contact the front desk to cancel");
	}

	const reason = payload.reason ?? "Cancelled by patient";
	const cancelled = await prisma.$transaction((tx) =>
		cancelActiveAppointments(tx, { id, patientId }, { reason, actorId: userId, now }),
	);
	if (cancelled.length === 0) {
		throw new AppError(httpStatus.CONFLICT, "This appointment was just changed — refresh and try again");
	}

	await finalizeCancellations(cancelled, reason);
	return toAppointmentResponse(await findAppointmentOrThrow({ id, patientId }));
};

const recordDeskPayment = async (authUser: TAuthPayload, id: string, { method }: TDeskPaymentPayload) => {
	const now = new Date();

	const sessionIds = await prisma.$transaction(async (tx) => {
		await lockAppointment(tx, id);

		const appointment = await tx.appointment.findUnique({
			where: { id },
			select: {
				status: true,
				holdExpiresAt: true,
				feeCents: true,
				payments: {
					where: { status: { in: [PaymentStatus.PENDING, PaymentStatus.SUCCEEDED] } },
					select: { status: true, stripeSessionId: true },
				},
			},
		});
		if (!appointment) throw new AppError(httpStatus.NOT_FOUND, "Appointment not found");

		const holdActive =
			appointment.status === AppointmentStatus.PENDING_PAYMENT &&
			appointment.holdExpiresAt !== null &&
			appointment.holdExpiresAt > now;
		if (appointment.status !== AppointmentStatus.CONFIRMED && !holdActive) {
			throw new AppError(httpStatus.CONFLICT, `Can't take payment for a ${appointment.status} appointment`);
		}
		if (appointment.payments.some((payment) => payment.status === PaymentStatus.SUCCEEDED)) {
			throw new AppError(httpStatus.CONFLICT, "Consultation fee is already paid");
		}

		await tx.payment.updateMany({
			where: { appointmentId: id, status: PaymentStatus.PENDING },
			data: { status: PaymentStatus.FAILED },
		});
		await tx.payment.create({
			data: {
				appointmentId: id,
				provider: PaymentProvider.DESK,
				status: PaymentStatus.SUCCEEDED,
				deskMethod: method,
				receivedById: authUser.userId,
				amountCents: appointment.feeCents,
				currency,
				paidAt: now,
			},
		});
		if (holdActive) {
			await tx.appointment.update({
				where: { id },
				data: { status: AppointmentStatus.CONFIRMED, paymentMode: AppointmentPaymentMode.AT_DESK },
			});
		}

		return appointment.payments.flatMap((payment) => (payment.stripeSessionId ? [payment.stripeSessionId] : []));
	});

	await Promise.all(sessionIds.map(expireCheckoutSession));
	return toAppointmentResponse(await findAppointmentOrThrow({ id }));
};

const startOnlinePayment = async (id: string, patientId: string | null) => {
	const now = new Date();

	const prepared = await prisma.$transaction(async (tx) => {
		await lockAppointment(tx, id);

		const appointment = await tx.appointment.findFirst({
			where: { id, ...(patientId ? { patientId } : {}) },
			select: {
				status: true,
				holdExpiresAt: true,
				feeCents: true,
				payments: {
					where: { status: { in: [PaymentStatus.PENDING, PaymentStatus.SUCCEEDED] } },
					select: { status: true, stripeSessionId: true },
				},
			},
		});
		if (!appointment) throw new AppError(httpStatus.NOT_FOUND, "Appointment not found");

		if (appointment.payments.some((payment) => payment.status === PaymentStatus.SUCCEEDED)) {
			throw new AppError(httpStatus.CONFLICT, "Consultation fee is already paid");
		}

		const holdActive =
			appointment.status === AppointmentStatus.PENDING_PAYMENT &&
			appointment.holdExpiresAt !== null &&
			appointment.holdExpiresAt > now;
		if (appointment.status !== AppointmentStatus.CONFIRMED && !holdActive) {
			throw new AppError(
				httpStatus.CONFLICT,
				appointment.status === AppointmentStatus.PENDING_PAYMENT || appointment.status === AppointmentStatus.EXPIRED
					? "The booking hold has ended — please book again"
					: `Can't pay for a ${appointment.status} appointment`,
			);
		}
		if (appointment.feeCents < APPOINTMENT_CONFIG.minOnlineAmountCents) {
			throw new AppError(httpStatus.BAD_REQUEST, "This fee is too small for online payment — pay at the front desk");
		}

		await tx.payment.updateMany({
			where: { appointmentId: id, status: PaymentStatus.PENDING },
			data: { status: PaymentStatus.FAILED },
		});
		await tx.appointment.update({
			where: { id },
			data: {
				paymentMode: AppointmentPaymentMode.ONLINE,
				...(holdActive ? { holdExpiresAt: new Date(now.getTime() + APPOINTMENT_CONFIG.holdMinutes * MINUTE_MS) } : {}),
			},
		});
		const payment = await tx.payment.create({
			data: { appointmentId: id, provider: PaymentProvider.STRIPE, amountCents: appointment.feeCents, currency },
			select: { id: true },
		});

		return {
			paymentId: payment.id,
			oldSessionIds: appointment.payments.flatMap((p) => (p.stripeSessionId ? [p.stripeSessionId] : [])),
		};
	});

	await Promise.all(prepared.oldSessionIds.map(expireCheckoutSession));

	const appointment = await findAppointmentOrThrow({ id });
	const checkoutUrl = await openCheckout(appointment, prepared.paymentId);
	return { appointment, checkoutUrl };
};

const sendPaymentLink = async (id: string) => {
	const { appointment, checkoutUrl } = await startOnlinePayment(id, null);
	const expiresAt = appointment.holdExpiresAt ?? new Date(Date.now() + APPOINTMENT_CONFIG.holdMinutes * MINUTE_MS);

	await sendSafely(`payment link ${appointment.appointmentNumber}`, () =>
		emailPaymentLink(appointment, checkoutUrl, currency, expiresAt),
	);

	return { appointment: toAppointmentResponse(appointment), checkoutUrl };
};

const payMyAppointment = async (userId: string, id: string) => {
	const patientId = await findMyPatientId(userId);
	const { appointment, checkoutUrl } = await startOnlinePayment(id, patientId);
	return { appointment: toAppointmentResponse(appointment), checkoutUrl };
};

const undoCheckIn = async (id: string) => {
	const appointment = await findAppointmentOrThrow({ id });

	if (appointment.status !== AppointmentStatus.CHECKED_IN) {
		throw new AppError(
			httpStatus.CONFLICT,
			`Only a checked-in appointment can be undone (this one is ${appointment.status})`,
		);
	}
	if (appointment.prescription) {
		throw new AppError(httpStatus.CONFLICT, "The doctor has already started this consultation");
	}

	const { count } = await prisma.appointment.updateMany({
		where: { id, status: AppointmentStatus.CHECKED_IN, prescription: { is: null } },
		data: { status: AppointmentStatus.CONFIRMED, checkedInAt: null, checkedInById: null },
	});
	if (count === 0) {
		throw new AppError(httpStatus.CONFLICT, "This appointment was just changed — refresh and try again");
	}

	return toAppointmentResponse(await findAppointmentOrThrow({ id }));
};

export const AppointmentService = {
	bookAppointment,
	getAppointments,
	getAppointmentById,
	getMyAppointments,
	getMyAppointmentPeriods,
	getMyAppointmentById,
	cancelAppointment,
	cancelMyAppointment,
	recordDeskPayment,
	sendPaymentLink,
	payMyAppointment,
	checkInAppointment,
	completeAppointment,
	savePrescription,
	markNoShow,
	undoCheckIn,
};
