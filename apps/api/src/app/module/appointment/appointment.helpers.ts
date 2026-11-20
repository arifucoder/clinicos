import { envVars } from "@/app/config/env";
import { prisma } from "@/app/lib/prisma";
import { nextCounter } from "@/app/utils/counter";
import type { Prisma } from "@/generated/prisma/client";
import { AppointmentStatus, PaymentProvider, PaymentStatus } from "@/generated/prisma/enums";
import { expireCheckoutSession, refundStripePayment } from "../payment/payment.stripe";
import { addDaysToDate, clinicDateOf, clinicDayStartUtc } from "../slot/slot.utils";
import { emailAppointmentCancelled, sendSafely } from "./appointment.email";

const TZ = envVars.CLINIC_TIME_ZONE;

export const activeAppointmentWhere = (now: Date): Prisma.AppointmentWhereInput => ({
	OR: [
		{ status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.CHECKED_IN] } },
		{ status: AppointmentStatus.PENDING_PAYMENT, holdExpiresAt: { gt: now } },
	],
});

export const CANCELLABLE_STATUSES: AppointmentStatus[] = [
	AppointmentStatus.PENDING_PAYMENT,
	AppointmentStatus.CONFIRMED,
];

export const clinicDayRange = (date: string) => ({
	gte: clinicDayStartUtc(date, TZ),
	lt: clinicDayStartUtc(addDaysToDate(date, 1), TZ),
});

export const nextAppointmentNumber = async (tx: Prisma.TransactionClient, now: Date) => {
	const year = clinicDateOf(now, TZ).slice(0, 4);
	const value = await nextCounter(tx, `appointment:${year}`);
	return `APT-${year}-${String(value).padStart(6, "0")}`;
};

export const expireStaleHolds = async (
	tx: Prisma.TransactionClient,
	where: Prisma.AppointmentWhereInput,
	now: Date,
) => {
	const expired = await tx.appointment.updateManyAndReturn({
		where: { AND: [where, { status: AppointmentStatus.PENDING_PAYMENT, holdExpiresAt: { lte: now } }] },
		data: { status: AppointmentStatus.EXPIRED },
		select: { id: true },
	});
	if (expired.length === 0) return { expiredCount: 0, sessionIds: [] };

	const ids = expired.map((appointment) => appointment.id);
	const pending = await tx.payment.findMany({
		where: { appointmentId: { in: ids }, status: PaymentStatus.PENDING },
		select: { stripeSessionId: true },
	});
	await tx.payment.updateMany({
		where: { appointmentId: { in: ids }, status: PaymentStatus.PENDING },
		data: { status: PaymentStatus.FAILED },
	});

	return {
		expiredCount: ids.length,
		sessionIds: pending.flatMap((payment) => (payment.stripeSessionId ? [payment.stripeSessionId] : [])),
	};
};

const cancellationSelect = {
	id: true,
	appointmentNumber: true,
	startAt: true,
	feeCents: true,
	patient: { select: { fullName: true, user: { select: { email: true } } } },
	doctor: { select: { user: { select: { name: true } } } },
	payments: {
		where: { status: { in: [PaymentStatus.PENDING, PaymentStatus.SUCCEEDED] } },
		select: { id: true, provider: true, status: true, stripeSessionId: true, stripePaymentIntentId: true },
	},
} satisfies Prisma.AppointmentSelect;

export type TCancelledAppointment = Prisma.AppointmentGetPayload<{ select: typeof cancellationSelect }>;

type TCancelContext = { reason: string; actorId: string; now: Date };

export const cancelActiveAppointments = async (
	tx: Prisma.TransactionClient,
	where: Prisma.AppointmentWhereInput,
	{ reason, actorId, now }: TCancelContext,
): Promise<TCancelledAppointment[]> => {
	const updated = await tx.appointment.updateManyAndReturn({
		where: { AND: [where, { status: { in: CANCELLABLE_STATUSES } }] },
		data: { status: AppointmentStatus.CANCELLED, cancelledAt: now, cancelReason: reason, cancelledById: actorId },
		select: { id: true },
	});
	if (updated.length === 0) return [];

	const ids = updated.map((appointment) => appointment.id);

	const cancelled = await tx.appointment.findMany({ where: { id: { in: ids } }, select: cancellationSelect });

	await tx.payment.updateMany({
		where: { appointmentId: { in: ids }, status: PaymentStatus.PENDING },
		data: { status: PaymentStatus.FAILED },
	});
	await tx.payment.updateMany({
		where: { appointmentId: { in: ids }, provider: PaymentProvider.DESK, status: PaymentStatus.SUCCEEDED },
		data: { status: PaymentStatus.REFUNDED, refundedAt: now },
	});

	return cancelled;
};

const settlePayments = async (appointment: TCancelledAppointment): Promise<string | null> => {
	let refundNote: string | null = null;

	for (const payment of appointment.payments) {
		if (payment.provider === PaymentProvider.DESK && payment.status === PaymentStatus.SUCCEEDED) {
			refundNote = "Please collect your consultation fee from the front desk.";
			continue;
		}

		if (payment.status === PaymentStatus.PENDING && payment.stripeSessionId) {
			await expireCheckoutSession(payment.stripeSessionId);
			continue;
		}

		if (payment.status === PaymentStatus.SUCCEEDED && payment.stripePaymentIntentId) {
			try {
				await refundStripePayment(payment.stripePaymentIntentId, payment.id);
				await prisma.payment.update({
					where: { id: payment.id },
					data: { status: PaymentStatus.REFUNDED, refundedAt: new Date() },
				});
				refundNote = "Your online payment has been refunded. It can take 5–10 business days to show on your card.";
			} catch (error) {
				console.error(`[refund] payment ${payment.id} failed — refund it from the Stripe dashboard`, error);
				refundNote = "Your refund is being processed. The front desk will contact you if anything else is needed.";
			}
		}
	}

	return refundNote;
};

export const finalizeCancellations = async (appointments: TCancelledAppointment[], reason: string) => {
	for (const appointment of appointments) {
		const refundNote = await settlePayments(appointment);
		await sendSafely(`cancel ${appointment.appointmentNumber}`, () =>
			emailAppointmentCancelled(appointment, reason, refundNote),
		);
	}
};
