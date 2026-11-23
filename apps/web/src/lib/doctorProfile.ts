import { addDays, dateRange, formatClinicTime } from "@/lib/clinicDate";
import { BOOKING_WINDOW_DAYS } from "@/lib/findDoctor";
import type { PublicSlot, PublicSlotDay } from "@/types/slot.types";

export const PATIENT_BOOK_PATH = "/portal/book";
export const bookSlotHref = (doctorId: string, slotId: string) =>
	`${PATIENT_BOOK_PATH}?doctorId=${doctorId}&slotId=${slotId}`;

const DAY_MINUTES = 24 * 60;
const MINUTE_MS = 60_000;

export const clinicMinutes = (iso: string) => {
	const [hours = 0, minutes = 0] = formatClinicTime(iso).split(":").map(Number);
	return hours * 60 + minutes;
};

export interface TimeGroup {
	name: string;
	range: string;
	matches: (minutes: number) => boolean;
}

export const TIME_GROUPS: TimeGroup[] = [
	{ name: "Morning", range: "06:00 – 12:00", matches: (m) => m >= 360 && m < 720 },
	{ name: "Afternoon", range: "12:00 – 17:00", matches: (m) => m >= 720 && m < 1020 },
	{ name: "Evening", range: "17:00 – 22:00", matches: (m) => m >= 1020 && m < 1320 },
	{ name: "Night", range: "22:00 – 06:00", matches: (m) => m >= 1320 || m < 360 },
];

export interface BookingDay {
	date: string;
	slots: PublicSlot[];
	availableCount: number;
}

export const toBookingDays = (days: PublicSlotDay[], today: string): BookingDay[] => {
	const byDate = new Map(days.map((day) => [day.date, day.slots]));
	return dateRange(today, BOOKING_WINDOW_DAYS).map((date) => {
		const slots = byDate.get(date) ?? [];
		return { date, slots, availableCount: slots.filter((slot) => slot.status === "AVAILABLE").length };
	});
};

export interface OpenWindow {
	label: string; // "09:00 – 13:00"
	left: number; // timeline-এ % (দিনের শুরু থেকে)
	width: number;
}

export const toOpenWindows = (slots: PublicSlot[]): OpenWindow[] => {
	const available = slots.filter((slot) => slot.status === "AVAILABLE");
	const merged: { startAt: string; endAt: string }[] = [];

	for (const slot of available) {
		const last = merged.at(-1);
		if (last && last.endAt === slot.startAt) last.endAt = slot.endAt;
		else merged.push({ startAt: slot.startAt, endAt: slot.endAt });
	}

	return merged.map(({ startAt, endAt }) => {
		const start = clinicMinutes(startAt);
		const duration = (Date.parse(endAt) - Date.parse(startAt)) / MINUTE_MS;
		const end = Math.min(start + duration, DAY_MINUTES);
		return {
			label: `${formatClinicTime(startAt)} – ${formatClinicTime(endAt)}`,
			left: (start / DAY_MINUTES) * 100,
			width: ((end - start) / DAY_MINUTES) * 100,
		};
	});
};

export const firstOpenDate = (days: BookingDay[]) => days.find((day) => day.availableCount > 0)?.date;

export const nextOpenDateAfter = (days: BookingDay[], date: string) =>
	days.find((day) => day.date > date && day.availableCount > 0)?.date;

export const isWithinWindow = (date: string, today: string) =>
	date >= today && date <= addDays(today, BOOKING_WINDOW_DAYS - 1);
