import type { ManageSlot, ManageSlotDay } from "@/types/slot.types";

export const BOOK_PATH = "/admin/front-desk/book";

const CHECK_IN_OPENS_MS = 120 * 60_000; // api-র APPOINTMENT_CONFIG.checkInOpensMinutesBefore

export interface BookableSlot extends Pick<ManageSlot, "id" | "startAt" | "endAt"> {
	inProgress: boolean; // শুরু হয়ে গেছে, শেষ হয়নি → "Now"
	checkInOpen: boolean; // এখনই check-in করা যাবে কিনা (না গেলে toggle বন্ধ)
}

// Desk-এর নিয়ম (SDLC 3.10): OPEN আর endAt > now। Public endpoint ১ ঘণ্টার মধ্যের slot লুকায়।
export const toBookableSlots = (days: ManageSlotDay[], now: Date): BookableSlot[] =>
	days
		.flatMap((day) => day.slots)
		.filter((slot) => slot.state === "OPEN" && new Date(slot.endAt) > now)
		.map(({ id, startAt, endAt }) => {
			const start = new Date(startAt).getTime();
			return {
				id,
				startAt,
				endAt,
				inProgress: start <= now.getTime(),
				checkInOpen: start - CHECK_IN_OPENS_MS <= now.getTime(),
			};
		});

export interface BookableDay {
	date: string; // clinic-এর "YYYY-MM-DD"
	slots: BookableSlot[];
}

// ১৪ দিনের প্রতিটা দিন (খালি হলেও) + সেদিনের খালি slot।
// dates[0]-এর আগের দিনে শুরু হয়ে এখনো চলছে এমন slot (রাতের shift) → dates[0]-এ (আজ) যোগ হয়।
export const toBookableDays = (days: ManageSlotDay[], dates: string[], now: Date): BookableDay[] => {
	const firstDate = dates[0];
	const byDate = new Map<string, BookableSlot[]>();

	for (const day of days) {
		const key = firstDate && day.date < firstDate ? firstDate : day.date;
		byDate.set(key, [...(byDate.get(key) ?? []), ...toBookableSlots([day], now)]);
	}

	return dates.map((date) => ({ date, slots: byDate.get(date) ?? [] }));
};
