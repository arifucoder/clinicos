import { TZDate } from "@date-fns/tz";
import { addDays, addMinutes } from "date-fns";
import { envVars } from "@/app/config/env";
import { prisma } from "@/app/lib/prisma";
import { Role } from "@/generated/prisma/enums";

/** How far ahead every active doctor should always have open slots. */
export const SLOT_WINDOW_DAYS = 14;
const SHIFT_START_HOUR = 9;
const SHIFT_END_HOUR = 13;

type SlotRow = { doctorId: string; startAt: Date; endAt: Date; createdById: string };

type BuildSlotsInput = {
	doctorId: string;
	slotMinutes: number;
	createdById: string;
	from: Date;
	days: number;
	timeZone: string;
};

/** Pure function: one daily shift (09:00–13:00 clinic time) per day, split into slots. Output is UTC. */
export const buildDailySlots = ({ doctorId, slotMinutes, createdById, from, days, timeZone }: BuildSlotsInput): SlotRow[] => {
	const rows: SlotRow[] = [];
	const firstDay = new TZDate(from.getTime(), timeZone);

	for (let i = 0; i < days; i++) {
		const day = addDays(firstDay, i);
		const [y, m, d] = [day.getFullYear(), day.getMonth(), day.getDate()];
		let cursor = new TZDate(y, m, d, SHIFT_START_HOUR, 0, timeZone);
		const shiftEnd = new TZDate(y, m, d, SHIFT_END_HOUR, 0, timeZone);

		while (cursor.getTime() < shiftEnd.getTime()) {
			const next = addMinutes(cursor, slotMinutes);
			rows.push({ doctorId, startAt: new Date(cursor.getTime()), endAt: new Date(next.getTime()), createdById });
			cursor = next;
		}
	}
	return rows;
};

/**
 * Tops every active doctor up to a rolling SLOT_WINDOW_DAYS window.
 * Idempotent: @@unique([doctorId, startAt]) + skipDuplicates means re-runs never duplicate.
 * Without doctorIds, only doctors that already have a schedule (≥1 slot) are refilled.
 */
export const refillDoctorSlots = async (doctorIds?: string[]): Promise<number> => {
	const superAdmin = await prisma.user.findFirst({ where: { role: Role.SUPER_ADMIN }, select: { id: true } });
	if (!superAdmin) throw new Error("Slot refill needs a SUPER_ADMIN. Run `pnpm seed:superadmin` first.");

	const doctors = await prisma.doctorProfile.findMany({
		where: {
			isPaused: false,
			user: { isDeleted: false, isActive: true },
			...(doctorIds ? { id: { in: doctorIds } } : { slots: { some: {} } }),
		},
		select: { id: true, slotMinutesDefault: true },
	});

	const now = new Date();
	const rows = doctors
		.flatMap((doctor) =>
			buildDailySlots({
				doctorId: doctor.id,
				slotMinutes: doctor.slotMinutesDefault,
				createdById: superAdmin.id,
				from: now,
				days: SLOT_WINDOW_DAYS + 1,
				timeZone: envVars.CLINIC_TIME_ZONE,
			}),
		)
		.filter((row) => row.startAt > now);

	if (rows.length === 0) return 0;
	const { count } = await prisma.doctorSlot.createMany({ data: rows, skipDuplicates: true });
	return count;
};
