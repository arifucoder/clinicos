import { prisma } from "@/app/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { AppointmentStatus, PaymentStatus, SlotStatus } from "@/generated/prisma/enums";
import type { Stripe } from "stripe";
import { appointmentSelect } from "../appointment/appointment.constant";
import { emailAppointmentCancelled, emailAppointmentConfirmed, sendSafely } from "../appointment/appointment.email";
import { activeAppointmentWhere, expireStaleHolds } from "../appointment/appointment.helpers";
import { expireCheckoutSession, getPaymentIntentId, refundStripePayment } from "./payment.stripe";

type TWebhookResult = { message: string };

// Hold শেষে EXPIRED হওয়া appointment-এ দেরিতে টাকা এলে: slot তখনও খালি থাকলে আবার CONFIRMED করা যায়
const canReviveExpired = async (tx: Prisma.TransactionClient, slotId: string, now: Date) => {
	await tx.$queryRaw`SELECT id FROM "doctor_slots" WHERE id = ${slotId} FOR UPDATE`;

	const slot = await tx.doctorSlot.findUnique({ where: { id: slotId }, select: { status: true, startAt: true } });
	if (!slot || slot.status !== SlotStatus.OPEN || slot.startAt <= now) return false;

	await expireStaleHolds(tx, { slotId }, now);
	const taken = await tx.appointment.findFirst({
		where: { slotId, ...activeAppointmentWhere(now) },
		select: { id: true },
	});
	return !taken;
};

type TPaidOutcome =
	| { kind: "ignored" }
	| { kind: "duplicate" }
	| { kind: "confirmed"; appointmentId: string }
	| { kind: "refund"; appointmentId: string; paymentId: string; wasExpired: boolean };

// checkout.session.completed: টাকা কেটেছে → payment SUCCEEDED + appointment CONFIRMED, নাহলে refund
const handleCheckoutPaid = async (session: Stripe.Checkout.Session, eventId: string): Promise<TWebhookResult> => {
	// Card ছাড়া ধীর পদ্ধতিতে (bank transfer) completed আসে কিন্তু টাকা পরে আসে
	if (session.payment_status !== "paid") return { message: `Session ${session.id} is not paid yet` };

	const paymentId = session.metadata?.paymentId;
	if (!paymentId) return { message: `Session ${session.id} has no paymentId in metadata` };

	const paymentIntentId = getPaymentIntentId(session);
	const now = new Date();

	const outcome = await prisma.$transaction(async (tx): Promise<TPaidOutcome> => {
		const payment = await tx.payment.findUnique({ where: { id: paymentId }, select: { appointmentId: true } });
		if (!payment) return { kind: "ignored" };

		// Appointment row lock → desk payment, cancel, cron এই মুহূর্তে একই appointment ছুঁতে পারবে না
		await tx.$queryRaw`SELECT id FROM "appointments" WHERE id = ${payment.appointmentId} FOR UPDATE`;

		const current = await tx.payment.findUniqueOrThrow({ where: { id: paymentId }, select: { status: true } });
		// Idempotency: Stripe একই event আবার পাঠালে (retry) কিছুই বদলায় না
		if (current.status === PaymentStatus.SUCCEEDED || current.status === PaymentStatus.REFUNDED) {
			return { kind: "duplicate" };
		}

		const appointment = await tx.appointment.findUniqueOrThrow({
			where: { id: payment.appointmentId },
			select: {
				id: true,
				status: true,
				slotId: true,
				payments: { where: { status: PaymentStatus.SUCCEEDED }, select: { id: true } },
			},
		});

		const alreadyPaid = appointment.payments.length > 0; // যেমন: desk-এ আগেই cash নেওয়া হয়েছে
		let confirm = false;
		if (!alreadyPaid) {
			if (
				appointment.status === AppointmentStatus.PENDING_PAYMENT ||
				appointment.status === AppointmentStatus.CONFIRMED
			) {
				confirm = true;
			} else if (appointment.status === AppointmentStatus.EXPIRED) {
				confirm = await canReviveExpired(tx, appointment.slotId, now);
			}
		}

		if (confirm) {
			await tx.payment.update({
				where: { id: paymentId },
				data: {
					status: PaymentStatus.SUCCEEDED,
					stripeEventId: eventId,
					stripePaymentIntentId: paymentIntentId,
					paidAt: now,
				},
			});
			await tx.appointment.update({
				where: { id: appointment.id },
				data: { status: AppointmentStatus.CONFIRMED },
			});
			return { kind: "confirmed", appointmentId: appointment.id };
		}

		// টাকা নেওয়া যাবে না (cancelled / অন্য কেউ slot নিয়েছে / আগেই paid) → refund-এর জন্য তথ্য রেখে দেওয়া
		await tx.payment.update({
			where: { id: paymentId },
			data: { stripeEventId: eventId, stripePaymentIntentId: paymentIntentId },
		});
		return {
			kind: "refund",
			appointmentId: appointment.id,
			paymentId,
			wasExpired: appointment.status === AppointmentStatus.EXPIRED,
		};
	});

	if (outcome.kind === "ignored") return { message: `Payment ${paymentId} not found` };
	if (outcome.kind === "duplicate") return { message: `Event for payment ${paymentId} already processed` };

	const appointment = await prisma.appointment.findUniqueOrThrow({
		where: { id: outcome.appointmentId },
		select: appointmentSelect,
	});

	if (outcome.kind === "confirmed") {
		await sendSafely(`confirm ${appointment.appointmentNumber}`, () =>
			emailAppointmentConfirmed(appointment, "Paid online"),
		);
		return { message: `Appointment ${appointment.appointmentNumber} confirmed` };
	}

	// Refund — Stripe call transaction-এর বাইরে; fail করলে error → 500 → Stripe নিজেই webhook আবার পাঠাবে
	if (!paymentIntentId) throw new Error(`Session ${session.id} has no payment intent to refund`);
	await refundStripePayment(paymentIntentId, outcome.paymentId);
	await prisma.payment.update({
		where: { id: outcome.paymentId },
		data: { status: PaymentStatus.REFUNDED, refundedAt: new Date() },
	});

	if (outcome.wasExpired) {
		await sendSafely(`late payment ${appointment.appointmentNumber}`, () =>
			emailAppointmentCancelled(
				appointment,
				"Your payment arrived after the 30-minute hold ended and the time was no longer available.",
				"Your payment has been refunded. It can take 5–10 business days to show on your card.",
			),
		);
	}

	return { message: `Payment ${outcome.paymentId} refunded` };
};

// Session expire / async payment fail: শুধু এই payment FAILED। Appointment-এর hold সামলায় cron।
const handleCheckoutFailed = async (session: Stripe.Checkout.Session): Promise<TWebhookResult> => {
	const paymentId = session.metadata?.paymentId;
	if (!paymentId) return { message: `Session ${session.id} has no paymentId in metadata` };

	await prisma.payment.updateMany({
		where: { id: paymentId, status: PaymentStatus.PENDING },
		data: { status: PaymentStatus.FAILED },
	});
	return { message: `Payment ${paymentId} marked failed` };
};

const handleStripeEvent = async (event: Stripe.Event): Promise<TWebhookResult> => {
	switch (event.type) {
		case "checkout.session.completed":
		case "checkout.session.async_payment_succeeded":
			return handleCheckoutPaid(event.data.object, event.id);

		case "checkout.session.expired":
		case "checkout.session.async_payment_failed":
			return handleCheckoutFailed(event.data.object);

		default:
			return { message: `Ignored event ${event.type}` };
	}
};

// Cron: hold শেষ হওয়া booking → EXPIRED (slot আবার খালি), খোলা Stripe link বন্ধ
const expireUnpaidHolds = async () => {
	const now = new Date();
	const { expiredCount, sessionIds } = await prisma.$transaction((tx) => expireStaleHolds(tx, {}, now));
	await Promise.all(sessionIds.map(expireCheckoutSession));
	return expiredCount;
};

export const PaymentService = {
	handleStripeEvent,
	expireUnpaidHolds,
};
