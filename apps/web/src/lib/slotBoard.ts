import { dateRange } from "@/lib/clinicDate";
import type { ManageSlotDay } from "@/types/slot.types";
import { BOARD_DAYS } from "@/zod/slot.validation";

// api শুধু যেদিন slot আছে সেদিন দেয় → ৭ দিনই দেখাতে খালি দিন বসাই
export const fillWeek = (from: string, slotDays: ManageSlotDay[]): ManageSlotDay[] => {
	const byDate = new Map(slotDays.map((day) => [day.date, day.slots]));
	return dateRange(from, BOARD_DAYS).map((date) => ({ date, slots: byDate.get(date) ?? [] }));
};
