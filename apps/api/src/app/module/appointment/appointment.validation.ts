import { AppointmentPaymentMode, PaymentMethod } from "@/generated/prisma/enums";
import * as z from "zod";

const bookAppointmentSchema = z
	.object({
		slotId: z.uuid("Invalid slot id"),
		paymentMode: z.enum(AppointmentPaymentMode, "paymentMode must be AT_DESK or ONLINE"),
		reason: z.string().trim().min(2).max(500).optional(),
		// নিচের দুটো শুধু front desk (ADMINS) পাঠাতে পারে — service-এ যাচাই
		patientId: z.uuid("Invalid patient id").optional(),
		deskPaymentMethod: z.enum(PaymentMethod, "deskPaymentMethod must be CASH, CARD or MOBILE").optional(),
	})
	.refine((data) => !data.deskPaymentMethod || data.paymentMode === AppointmentPaymentMode.AT_DESK, {
		error: "deskPaymentMethod works only with paymentMode AT_DESK",
		path: ["deskPaymentMethod"],
	});

const cancelAppointmentSchema = z.object({
	reason: z.string().trim().min(3, "Reason must be at least 3 characters").max(200),
});

// রোগীর cancel-এ কারণ ঐচ্ছিক; body না পাঠালেও চলবে
const cancelMyAppointmentSchema = z.object({ reason: z.string().trim().min(3).max(200).optional() }).default({});

const deskPaymentSchema = z.object({
	method: z.enum(PaymentMethod, "method must be CASH, CARD or MOBILE"),
});

const listQuerySchema = z.object({
	date: z.iso.date("date must be in YYYY-MM-DD format").optional(),
});

export const AppointmentValidation = {
	bookAppointmentSchema,
	cancelAppointmentSchema,
	cancelMyAppointmentSchema,
	deskPaymentSchema,
	listQuerySchema,
};
