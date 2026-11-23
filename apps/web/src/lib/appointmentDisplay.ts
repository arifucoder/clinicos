import type { StatusTone } from "@/components/shared/StatusPill";
import type { Appointment, AppointmentStatus, PaymentMethod } from "@/types/appointment.types";
export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
	CASH: "Cash",
	CARD: "Card",
	MOBILE: "Mobile",
};

export const paidLabel = (appointment: Appointment): string | null => {
	const payment = appointment.payments.find((item) => item.status === "SUCCEEDED");
	if (!payment) return null;
	if (payment.provider === "STRIPE") return "Paid online";
	return payment.deskMethod ? `Paid at desk · ${PAYMENT_METHOD_LABEL[payment.deskMethod]}` : "Paid at desk";
};

export const APPOINTMENT_STATUS_META: Record<AppointmentStatus, { label: string; tone: StatusTone }> = {
	PENDING_PAYMENT: { label: "Awaiting payment", tone: "warning" },
	CONFIRMED: { label: "Confirmed", tone: "info" },
	CHECKED_IN: { label: "Checked in", tone: "success" },
	COMPLETED: { label: "Completed", tone: "neutral" },
	CANCELLED: { label: "Cancelled", tone: "danger" },
	NO_SHOW: { label: "No-show", tone: "danger" },
	EXPIRED: { label: "Expired", tone: "neutral" },
};

export const SOURCE_LABEL: Record<Appointment["source"], string> = { ONLINE: "Online", STAFF: "Front desk" };

const MINUTE_MS = 60_000;
const CHECK_IN_OPENS_MINUTES_BEFORE = 120;
const NO_SHOW_AFTER_MINUTES = 30;

export const noShowOpensAt = (appointment: Appointment) =>
	new Date(new Date(appointment.startAt).getTime() + NO_SHOW_AFTER_MINUTES * MINUTE_MS).toISOString();

export const getAppointmentAbilities = (appointment: Appointment, nowMs: number) => {
	const startMs = new Date(appointment.startAt).getTime();
	const holdActive =
		appointment.status === "PENDING_PAYMENT" &&
		appointment.holdExpiresAt !== null &&
		new Date(appointment.holdExpiresAt).getTime() > nowMs;
	const payable = !appointment.isPaid && (appointment.status === "CONFIRMED" || holdActive);

	return {
		canCollectFee: payable,
		canSendPaymentLink: payable,
		canCheckIn:
			appointment.status === "CONFIRMED" &&
			appointment.isPaid &&
			nowMs >= startMs - CHECK_IN_OPENS_MINUTES_BEFORE * MINUTE_MS,
		canUndoCheckIn: appointment.status === "CHECKED_IN" && appointment.prescription === null,
		canMarkNoShow: appointment.status === "CONFIRMED" && nowMs >= startMs + NO_SHOW_AFTER_MINUTES * MINUTE_MS,
		canCancel: appointment.status === "PENDING_PAYMENT" || appointment.status === "CONFIRMED",
	};
};
