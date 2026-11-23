import type { Appointment, AppointmentPeriod, AppointmentStatus } from "@/types/appointment.types";
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

// ---------- বছর/মাস filter ----------
export const MONTH_LABELS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
] as const;

const pad = (value: number) => String(value).padStart(2, "0");

// year → পুরো বছর; year + month → সেই মাস। api-কে clinic-এর দিন পাঠাই ("YYYY-MM-DD")
export const periodToRange = (year?: number, month?: number): { from?: string; to?: string } => {
	if (!year) return {};
	if (!month) return { from: `${year}-01-01`, to: `${year}-12-31` };
	// Date.UTC(year, month, 0) = এই মাসের শেষ দিন (পরের মাসের "০" তারিখ)
	const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
	return { from: `${year}-${pad(month)}-01`, to: `${year}-${pad(month)}-${pad(lastDay)}` };
};

// api যে বছর/মাস দেয় (যেখানে appointment আছে) + URL-এ বাছাই করা মান।
// বাছাই করা মান তালিকায় না থাকলে chip খালি দেখাত, অথচ filter চালু থাকত → সেটাও যোগ করি
const withSelected = (values: number[], selected?: number) =>
	selected && !values.includes(selected) ? [...values, selected].sort((a, b) => b - a) : values;

export const periodOptions = (periods: AppointmentPeriod[], year?: number, month?: number) => {
	const years = withSelected(
		periods.map((period) => period.year),
		year,
	);
	// মাস শুধু বাছাই করা বছরের; ক্যালেন্ডারের ক্রমে (জানুয়ারি আগে)
	const months = year
		? withSelected(periods.find((period) => period.year === year)?.months ?? [], month).sort((a, b) => a - b)
		: [];
	return { years, months };
};
