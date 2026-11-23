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

// "Today · 17:30" / "Tomorrow · 09:00" / "Tue 24 Nov · 09:00" (clinic-এর সময়ে)
export const formatNextAvailable = (iso: string, today: string) => {
	const day = clinicToday(new Date(iso));
	const label = day === today ? "Today" : day === addDays(today, 1) ? "Tomorrow" : formatDayLabel(day);
	return `${label} · ${formatClinicTime(iso)}`;
};

// Calendar browser-এর local সময়ে কাজ করে (local midnight-এর Date)।
// toISOString() দিলে ঢাকায় UTC-তে আগের দিন হয়ে যায় → তাই local getter/constructor।
export const toCalendarDate = (date: string) => {
	const [year, month, day] = date.split("-").map(Number);
	return new Date(year, month - 1, day);
};
export const fromCalendarDate = (day: Date) =>
	`${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
