import type { Appointment, PaymentMethod } from "@/types/appointment.types";

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
	CASH: "Cash",
	CARD: "Card",
	MOBILE: "Mobile",
};

// "Paid online" / "Paid at desk · Cash" / null (unpaid)
export const paidLabel = (appointment: Appointment): string | null => {
	const payment = appointment.payments.find((item) => item.status === "SUCCEEDED");
	if (!payment) return null;
	if (payment.provider === "STRIPE") return "Paid online";
	return payment.deskMethod ? `Paid at desk · ${PAYMENT_METHOD_LABEL[payment.deskMethod]}` : "Paid at desk";
};
