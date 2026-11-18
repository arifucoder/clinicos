import { describe, expect, it } from "vitest";
import { buildSlots, type TSlotTime } from "./slot.utils";

const base = { breaks: [], timeZone: "Asia/Dhaka" }; // UTC+6
const starts = (slots: TSlotTime[]) => slots.map((slot) => slot.startAt.toISOString());

describe("buildSlots", () => {
	it("splits a simple shift into equal slots", () => {
		const slots = buildSlots({ ...base, date: "2026-11-21", startTime: "09:00", endTime: "10:00", slotMinutes: 15 });
		expect(slots).toHaveLength(4);
		expect(slots[0]?.startAt.toISOString()).toBe("2026-11-21T03:00:00.000Z");
		expect(slots.at(-1)?.endAt.toISOString()).toBe("2026-11-21T04:00:00.000Z");
	});

	it("runs an overnight shift into the next day", () => {
		const slots = buildSlots({ ...base, date: "2026-11-20", startTime: "22:00", endTime: "06:00", slotMinutes: 30 });
		expect(slots).toHaveLength(16);
		expect(slots.at(-1)?.startAt.toISOString()).toBe("2026-11-20T23:30:00.000Z"); // Sat 05:30 Dhaka
	});

	it("drops the leftover when the range doesn't divide evenly", () => {
		const slots = buildSlots({ ...base, date: "2026-11-21", startTime: "09:00", endTime: "09:50", slotMinutes: 20 });
		expect(slots).toHaveLength(2);
	});

	it("restarts counting right after a break", () => {
		const slots = buildSlots({
			...base,
			date: "2026-11-21",
			startTime: "09:00",
			endTime: "13:00",
			slotMinutes: 15,
			breaks: [{ startTime: "11:00", endTime: "11:10" }],
		});
		expect(slots).toHaveLength(15);
		expect(starts(slots)).not.toContain("2026-11-21T05:00:00.000Z"); // 11:00
		expect(starts(slots)).toContain("2026-11-21T05:10:00.000Z"); // 11:10
	});

	it("handles a break after midnight in an overnight shift", () => {
		const slots = buildSlots({
			...base,
			date: "2026-11-20",
			startTime: "22:00",
			endTime: "06:00",
			slotMinutes: 30,
			breaks: [{ startTime: "02:00", endTime: "02:30" }],
		});
		expect(slots).toHaveLength(15);
		expect(starts(slots)).not.toContain("2026-11-20T20:00:00.000Z"); // Sat 02:00 Dhaka
	});

	it("uses the given time zone, not the server's", () => {
		const slots = buildSlots({
			...base,
			timeZone: "America/New_York",
			date: "2026-11-21",
			startTime: "09:00",
			endTime: "09:15",
			slotMinutes: 15,
		});
		expect(slots[0]?.startAt.toISOString()).toBe("2026-11-21T14:00:00.000Z"); // EST = UTC-5
	});
});
