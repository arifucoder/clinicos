import type { ManageSlot, ManageSlotDay } from "@/types/slot.types";

export interface BookableSlot extends Pick<ManageSlot, "id" | "startAt" | "endAt"> {
	inProgress: boolean; // শুরু হয়ে গেছে কিন্তু শেষ হয়নি → UI-তে "Now" chip
}

export const toBookableSlots = (days: ManageSlotDay[], now: Date): BookableSlot[] =>
	days
		.flatMap((day) => day.slots)
		.filter((slot) => slot.state === "OPEN" && new Date(slot.endAt) > now)
		.map(({ id, startAt, endAt }) => ({
			id,
			startAt,
			endAt,
			inProgress: new Date(startAt) <= now,
		}));
