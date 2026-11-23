import type { Appointment, AppointmentStatus } from "@/types/appointment.types";
import type { PortalAppointmentTab } from "@/zod/appointment.validation";

interface PortalTabConfig {
	label: string;
	statuses: AppointmentStatus[];
	sortOrder: "asc" | "desc";
	emptyTitle: string;
	emptyDescription: string;
}

// upcoming: যা এখনো বাকি (সবচেয়ে কাছেরটা আগে); past: শেষ/বাতিল (নতুনটা আগে)
export const PORTAL_TAB_CONFIG: Record<PortalAppointmentTab, PortalTabConfig> = {
	upcoming: {
		label: "Upcoming",
		statuses: ["PENDING_PAYMENT", "CONFIRMED", "CHECKED_IN"],
		sortOrder: "asc",
		emptyTitle: "No upcoming appointments",
		emptyDescription: "Find a doctor and book a time that suits you.",
	},
	past: {
		label: "Past",
		statuses: ["COMPLETED", "CANCELLED", "NO_SHOW", "EXPIRED"],
		sortOrder: "desc",
		emptyTitle: "No past appointments yet",
		emptyDescription: "Your finished and cancelled appointments will show up here.",
	},
};

// api-র APPOINTMENT_CONFIG-এর সাথে একই মান রাখো (UI শুধু button লুকায়; আসল নিয়ম api-তে)
const MINUTE_MS = 60_000;
const PATIENT_CANCEL_BEFORE_MINUTES = 120;

// কোন row-এ কোন button। nowMs server থেকে আসে → hydration mismatch হয় না
export const getPortalAbilities = (appointment: Appointment, nowMs: number) => {
	const startMs = new Date(appointment.startAt).getTime();
	const holdActive =
		appointment.status === "PENDING_PAYMENT" &&
		appointment.holdExpiresAt !== null &&
		new Date(appointment.holdExpiresAt).getTime() > nowMs;
	const paidAtDesk = appointment.payments.some(
		(payment) => payment.provider === "DESK" && payment.status === "SUCCEEDED",
	);
	const cancellableStatus = appointment.status === "PENDING_PAYMENT" || appointment.status === "CONFIRMED";

	return {
		// api-র startOnlinePayment-এর শর্ত
		canPay: !appointment.isPaid && (appointment.status === "CONFIRMED" || holdActive),
		// api-র cancelMyAppointment-এর শর্ত; বাকি ক্ষেত্রে "call the front desk"
		canCancel: cancellableStatus && !paidAtDesk && startMs - nowMs >= PATIENT_CANCEL_BEFORE_MINUTES * MINUTE_MS,
		mustCallDesk: cancellableStatus && (paidAtDesk || startMs - nowMs < PATIENT_CANCEL_BEFORE_MINUTES * MINUTE_MS),
		canViewPrescription: appointment.status === "COMPLETED" && appointment.prescription !== null,
	};
};
