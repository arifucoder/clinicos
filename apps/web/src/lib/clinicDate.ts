import { CLINIC_TIME_ZONE } from "@/lib/format";

// "YYYY-MM-DD" = clinic-এর calendar তারিখ। হিসাব UTC midnight ধরে করি,
// তাই browser/server-এর timezone যাই হোক, দিন যোগ-বিয়োগে এক দিন সরে যায় না।
const toUtcMidnight = (date: string) => new Date(`${date}T00:00:00Z`);

// en-CA locale তারিখ দেয় "2026-11-22" আকারে
const isoDateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: CLINIC_TIME_ZONE });
export const clinicToday = (now: Date) => isoDateFormatter.format(now);

export const addDays = (date: string, days: number) => {
	const value = toUtcMidnight(date);
	value.setUTCDate(value.getUTCDate() + days);
	return value.toISOString().slice(0, 10);
};

export const dateRange = (from: string, count: number) =>
	Array.from({ length: count }, (_, index) => addDays(from, index));

// "2026-11-22" → "Sun 22 Nov" (date-only, তাই timeZone: UTC)
const dayLabelFormatter = new Intl.DateTimeFormat("en-GB", {
	weekday: "short",
	day: "numeric",
	month: "short",
	timeZone: "UTC",
});
export const formatDayLabel = (date: string) => dayLabelFormatter.format(toUtcMidnight(date));

// UTC instant → clinic-এর wall time "09:15"
const timeFormatter = new Intl.DateTimeFormat("en-GB", {
	hour: "2-digit",
	minute: "2-digit",
	hourCycle: "h23",
	timeZone: CLINIC_TIME_ZONE,
});
export const formatClinicTime = (iso: string) => timeFormatter.format(new Date(iso));
