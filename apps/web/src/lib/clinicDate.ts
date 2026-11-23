import { CLINIC_TIME_ZONE } from "@/lib/format";

const toUtcMidnight = (date: string) => new Date(`${date}T00:00:00Z`);

const isoDateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: CLINIC_TIME_ZONE });
export const clinicToday = (now: Date) => isoDateFormatter.format(now);

export const addDays = (date: string, days: number) => {
	const value = toUtcMidnight(date);
	value.setUTCDate(value.getUTCDate() + days);
	return value.toISOString().slice(0, 10);
};

export const dateRange = (from: string, count: number) =>
	Array.from({ length: count }, (_, index) => addDays(from, index));

const dayLabelFormatter = new Intl.DateTimeFormat("en-GB", {
	weekday: "short",
	day: "numeric",
	month: "short",
	timeZone: "UTC",
});
export const formatDayLabel = (date: string) => dayLabelFormatter.format(toUtcMidnight(date));

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
	hour: "2-digit",
	minute: "2-digit",
	hourCycle: "h23",
	timeZone: CLINIC_TIME_ZONE,
});
export const formatClinicTime = (iso: string) => timeFormatter.format(new Date(iso));

export const formatNextAvailable = (iso: string, today: string) => {
	const day = clinicToday(new Date(iso));
	const label = day === today ? "Today" : day === addDays(today, 1) ? "Tomorrow" : formatDayLabel(day);
	return `${label} · ${formatClinicTime(iso)}`;
};

export const toCalendarDate = (date: string) => {
	const [year, month, day] = date.split("-").map(Number);
	return new Date(year, month - 1, day);
};
export const fromCalendarDate = (day: Date) =>
	`${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
