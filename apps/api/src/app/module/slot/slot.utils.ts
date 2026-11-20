import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

export type TTimeRange = { startTime: string; endTime: string };
export type TSlotTime = { startAt: Date; endAt: Date };
export type TMinuteRange = { start: number; end: number };

export type TBuildSlotsInput = TTimeRange & {
	date: string;
	slotMinutes: number;
	breaks: TTimeRange[];
	timeZone: string;
};

const MINUTES_PER_DAY = 24 * 60;

export const toMinutes = (time: string): number => {
	const [hours = 0, minutes = 0] = time.split(":").map(Number);
	return hours * 60 + minutes;
};

export const toShiftWindow = ({ startTime, endTime }: TTimeRange): TMinuteRange => {
	const start = toMinutes(startTime);
	let end = toMinutes(endTime);
	if (end <= start) end += MINUTES_PER_DAY;
	return { start, end };
};

export const toBreakWindow = (range: TTimeRange, shift: TMinuteRange): TMinuteRange => {
	let start = toMinutes(range.startTime);
	if (start < shift.start) start += MINUTES_PER_DAY;
	let end = toMinutes(range.endTime);
	while (end <= start) end += MINUTES_PER_DAY;
	return { start, end };
};

export const subtractBreaks = (shift: TMinuteRange, breaks: TMinuteRange[]): TMinuteRange[] => {
	const sorted = breaks.toSorted((a, b) => a.start - b.start);
	const segments: TMinuteRange[] = [];
	let cursor = shift.start;

	for (const breakWindow of sorted) {
		if (breakWindow.start > cursor) segments.push({ start: cursor, end: breakWindow.start });
		cursor = Math.max(cursor, breakWindow.end);
	}
	if (cursor < shift.end) segments.push({ start: cursor, end: shift.end });

	return segments;
};

const wallTimeToUtc = (date: string, minuteOfDay: number, timeZone: string): Date => {
	const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
	const dayOffset = Math.floor(minuteOfDay / MINUTES_PER_DAY);
	const minutes = minuteOfDay % MINUTES_PER_DAY;
	const wall = new TZDate(year, month - 1, day + dayOffset, Math.floor(minutes / 60), minutes % 60, 0, 0, timeZone);
	return new Date(wall.getTime());
};

export const buildSlots = ({
	date,
	startTime,
	endTime,
	slotMinutes,
	breaks,
	timeZone,
}: TBuildSlotsInput): TSlotTime[] => {
	const shift = toShiftWindow({ startTime, endTime });
	const segments = subtractBreaks(
		shift,
		breaks.map((range) => toBreakWindow(range, shift)),
	);

	const slots: TSlotTime[] = [];
	for (const segment of segments) {
		for (let start = segment.start; start + slotMinutes <= segment.end; start += slotMinutes) {
			slots.push({
				startAt: wallTimeToUtc(date, start, timeZone),
				endAt: wallTimeToUtc(date, start + slotMinutes, timeZone),
			});
		}
	}
	return slots;
};

export const hasOverlap = (a: TSlotTime, b: TSlotTime): boolean => a.startAt < b.endAt && a.endAt > b.startAt;

export const clinicDateOf = (instant: Date, timeZone: string): string =>
	format(new TZDate(instant, timeZone), "yyyy-MM-dd");

export const formatClinicTime = (instant: Date, timeZone: string): string =>
	format(new TZDate(instant, timeZone), "EEE d MMM, HH:mm");

export const clinicDayStartUtc = (date: string, timeZone: string): Date => wallTimeToUtc(date, 0, timeZone);

export const addDaysToDate = (date: string, days: number): string => {
	const value = new Date(`${date}T00:00:00Z`);
	value.setUTCDate(value.getUTCDate() + days);
	return value.toISOString().slice(0, 10);
};

export const groupByClinicDate = <T extends { startAt: Date }>(slots: T[], timeZone: string) => {
	const groups = new Map<string, T[]>();
	for (const slot of slots) {
		const key = clinicDateOf(slot.startAt, timeZone);
		const list = groups.get(key);
		if (list) list.push(slot);
		else groups.set(key, [slot]);
	}
	return [...groups].map(([date, items]) => ({ date, slots: items }));
};
