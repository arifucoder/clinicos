import type { BloodGroup, Gender } from "@/types/patient.types";

// api-র appointmentSelect + toAppointmentResponse (appointment.constant.ts)। Date JSON হয়ে string আসে।
export type AppointmentStatus =
	| "PENDING_PAYMENT"
	| "CONFIRMED"
	| "CHECKED_IN"
	| "COMPLETED"
	| "CANCELLED"
	| "NO_SHOW"
	| "EXPIRED";

export type PaymentMethod = "CASH" | "CARD" | "MOBILE";

export interface AppointmentPayment {
	id: string;
	provider: "STRIPE" | "DESK";
	status: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
	amountCents: number;
	currency: string;
	deskMethod: PaymentMethod | null;
	paidAt: string | null;
	refundedAt: string | null;
	createdAt: string;
}

export interface AppointmentPrescription {
	symptoms: string | null;
	diagnosis: string | null;
	advice: string | null;
	followUpDate: string | null;
	updatedAt: string;
	items: {
		medicineName: string;
		dosage: string;
		frequency: string;
		durationDays: number | null;
		instructions: string | null;
	}[];
}

export interface Appointment {
	id: string;
	appointmentNumber: string;
	startAt: string;
	endAt: string;
	status: AppointmentStatus;
	source: "ONLINE" | "STAFF";
	paymentMode: "AT_DESK" | "ONLINE";
	feeCents: number;
	holdExpiresAt: string | null;
	reason: string | null;
	checkedInAt: string | null;
	completedAt: string | null;
	cancelledAt: string | null;
	cancelReason: string | null;
	createdAt: string;
	patient: {
		id: string;
		fullName: string;
		phone: string | null;
		allergies: string | null;
		dateOfBirth: string | null; // @db.Date → "1990-05-12T00:00:00.000Z"
		gender: Gender | null;
		bloodGroup: BloodGroup | null;
		user: { email: string };
	};
	doctor: {
		id: string;
		roomNumber: string | null;
		licenseNumber: string;
		specialties: string[]; // api join table চ্যাপ্টা করে নাম পাঠায়
		user: { name: string };
	};
	payments: AppointmentPayment[];
	prescription: AppointmentPrescription | null;
	isPaid: boolean; // api হিসাব করে পাঠায়: কোনো SUCCEEDED payment আছে কিনা
}

// POST /appointments → api-র response
export interface BookAppointmentResult {
	appointment: Appointment;
	checkoutUrl: string | null; // ONLINE হলে Stripe link (api নিজেই রোগীকে email করে)
}
