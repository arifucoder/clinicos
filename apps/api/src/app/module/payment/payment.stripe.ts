import { APPOINTMENT_CONFIG } from "@/app/config/appointment.config";
import { envVars } from "@/app/config/env";
import { stripe } from "@/app/config/stripe.config";
import { AppError } from "@/app/errorHelpers/AppError";
import httpStatus from "http-status";
import type { Stripe } from "stripe";

type TCheckoutInput = {
	appointmentId: string;
	paymentId: string;
	appointmentNumber: string;
	doctorName: string;
	amountCents: number;
	currency: string;
	customerEmail: string;
};

export const createCheckoutSession = async (input: TCheckoutInput) => {
	const metadata = { appointmentId: input.appointmentId, paymentId: input.paymentId };

	const session = await stripe.checkout.sessions.create(
		{
			mode: "payment",
			customer_email: input.customerEmail,
			line_items: [
				{
					quantity: 1,
					price_data: {
						currency: input.currency,
						unit_amount: input.amountCents,
						product_data: {
							name: `Consultation with Dr. ${input.doctorName}`,
							description: input.appointmentNumber,
						},
					},
				},
			],
			metadata,
			payment_intent_data: { metadata },
			expires_at: Math.floor(Date.now() / 1000) + APPOINTMENT_CONFIG.stripeSessionMinutes * 60,
			success_url: `${envVars.FRONTEND_URL}/portal/appointments?payment=success&appointment=${input.appointmentId}`,
			cancel_url: `${envVars.FRONTEND_URL}/portal/appointments?payment=cancelled&appointment=${input.appointmentId}`,
		},
		{ idempotencyKey: `checkout-${input.paymentId}` },
	);

	if (!session.url) {
		throw new AppError(httpStatus.BAD_GATEWAY, "Stripe did not return a checkout URL");
	}

	return { sessionId: session.id, url: session.url };
};

export const expireCheckoutSession = async (sessionId: string) => {
	try {
		await stripe.checkout.sessions.expire(sessionId);
	} catch (error) {
		console.warn(
			`[stripe] session ${sessionId} was not expired (already completed or expired?)`,
			error instanceof Error ? error.message : error,
		);
	}
};

export const refundStripePayment = (paymentIntentId: string, paymentId: string) =>
	stripe.refunds.create({ payment_intent: paymentIntentId }, { idempotencyKey: `refund-${paymentId}` });

export const getPaymentIntentId = (session: Stripe.Checkout.Session): string | null => {
	if (!session.payment_intent) return null;
	return typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id;
};
