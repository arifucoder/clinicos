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
		// desk-এ fee নিয়ে সাথে সাথে check-in (শুধু front desk)
		checkInNow: z.boolean().optional(),
	})
	.refine((data) => !data.deskPaymentMethod || data.paymentMode === AppointmentPaymentMode.AT_DESK, {
		error: "deskPaymentMethod works only with paymentMode AT_DESK",
		path: ["deskPaymentMethod"],
	})
	// fee না নিয়ে check-in হয় না
	.refine((data) => !data.checkInNow || data.deskPaymentMethod, {
		error: "checkInNow needs deskPaymentMethod — collect the fee first",
		path: ["checkInNow"],
	});

const cancelAppointmentSchema = z.object({
	reason: z.string().trim().min(3, "Reason must be at least 3 characters").max(200),
});

// রোগীর cancel-এ কারণ ঐচ্ছিক; body না পাঠালেও চলবে
const cancelMyAppointmentSchema = z.object({ reason: z.string().trim().min(3).max(200).optional() }).default({});

const deskPaymentSchema = z.object({
	method: z.enum(PaymentMethod, "method must be CASH, CARD or MOBILE"),
});

const prescriptionItemSchema = z.object({
	medicineName: z.string().trim().min(1, "Medicine name is required").max(120),
	dosage: z.string().trim().min(1, "Dosage is required").max(60), // "500 mg"
	frequency: z.string().trim().min(1, "Frequency is required").max(60), // "1+0+1"
	durationDays: z.int().min(1).max(365).optional(),
	instructions: z.string().trim().max(200).optional(), // "After meal"
});

// ওষুধ ছাড়াও (শুধু diagnosis/advice) prescription save করা যায় — তাই items default []
const prescriptionSchema = z.object({
	symptoms: z.string().trim().max(1000).optional(),
	diagnosis: z.string().trim().max(1000).optional(),
	advice: z.string().trim().max(1000).optional(),
	followUpDate: z.iso.date("followUpDate must be in YYYY-MM-DD format").optional(),
	items: z.array(prescriptionItemSchema).max(30).default([]),
});

const listQuerySchema = z.object({
	date: z.iso.date("date must be in YYYY-MM-DD format").optional(),
});

export const AppointmentValidation = {
	bookAppointmentSchema,
	cancelAppointmentSchema,
	cancelMyAppointmentSchema,
	deskPaymentSchema,
	prescriptionSchema,
	listQuerySchema,
};
