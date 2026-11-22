// api-র slot.service.ts (getManageSlots, openSlots, blockSlots, unblockSlots)
export type SlotState = "OPEN" | "BOOKED" | "BLOCKED";

export type AppointmentStatus =
	| "PENDING_PAYMENT"
	| "CONFIRMED"
	| "CHECKED_IN"
	| "COMPLETED"
	| "CANCELLED"
	| "NO_SHOW"
	| "EXPIRED";

export interface SlotBooking {
	id: string;
	appointmentNumber: string;
	status: AppointmentStatus;
	patient: { fullName: string };
}

export interface ManageSlot {
	id: string;
	startAt: string;
	endAt: string;
	status: "OPEN" | "BLOCKED"; // DB-র status; "booked" এখানে নেই (SDLC 3.8)
	blockReason: string | null;
	blockedAt: string | null;
	state: SlotState; // server হিসাব করে দেয়: BLOCKED > BOOKED > OPEN
	booking: SlotBooking | null;
}

export interface ManageSlotDay {
	date: string; // clinic-এর তারিখ
	slots: ManageSlot[];
}

export interface OpenSlotsResult {
	created: number;
	skippedPast: number;
}

export interface BlockSlotsResult {
	blocked: number;
	cancelledAppointments: number;
}

export interface SlotDoctorOption {
	id: string; // doctorProfile id
	name: string;
	specialties: string;
}
