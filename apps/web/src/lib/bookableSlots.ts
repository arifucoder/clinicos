import type { ManageSlot, ManageSlotDay } from "@/types/slot.types";

export interface BookableSlot extends Pick<ManageSlot, "id" | "startAt" | "endAt"> {
	inProgress: boolean; // শুরু হয়ে গেছে কিন্তু শেষ হয়নি → UI-তে "Now" chip
}

// Desk booking-এর নিয়ম (SDLC 3.10): slot OPEN আর endAt > now — এখন চলছে এমন slot-ও চলবে।
// Public endpoint ১ ঘণ্টার মধ্যের slot লুকায়, তাই manage data থেকে নিজেরা filter করি।
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
