import { AppointmentPaymentMode, AppointmentStatus, PaymentMethod } from "@/generated/prisma/enums";
import * as z from "zod";

const bookAppointmentSchema = z
	.object({
		slotId: z.uuid("Invalid slot id"),
		paymentMode: z.enum(AppointmentPaymentMode, "paymentMode must be AT_DESK or ONLINE"),
		reason: z.string().trim().min(2).max(500).optional(),
		patientId: z.uuid("Invalid patient id").optional(),
		deskPaymentMethod: z.enum(PaymentMethod, "deskPaymentMethod must be CASH, CARD or MOBILE").optional(),
		checkInNow: z.boolean().optional(),
	})
	.refine((data) => !data.deskPaymentMethod || data.paymentMode === AppointmentPaymentMode.AT_DESK, {
		error: "deskPaymentMethod works only with paymentMode AT_DESK",
		path: ["deskPaymentMethod"],
	})
	.refine((data) => !data.checkInNow || data.deskPaymentMethod, {
		error: "checkInNow needs deskPaymentMethod — collect the fee first",
		path: ["checkInNow"],
	});

const cancelAppointmentSchema = z.object({
	reason: z.string().trim().min(3, "Reason must be at least 3 characters").max(200),
});

const cancelMyAppointmentSchema = z.object({ reason: z.string().trim().min(3).max(200).optional() }).default({});

const deskPaymentSchema = z.object({
	method: z.enum(PaymentMethod, "method must be CASH, CARD or MOBILE"),
});

const prescriptionItemSchema = z.object({
	medicineName: z.string().trim().min(1, "Medicine name is required").max(120),
	dosage: z.string().trim().min(1, "Dosage is required").max(60),
	frequency: z.string().trim().min(1, "Frequency is required").max(60),
	durationDays: z.int().min(1).max(365).optional(),
	instructions: z.string().trim().max(200).optional(),
});

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

// patient portal: মাস/বছর অনুযায়ী দেখা → clinic-এর দিন "YYYY-MM-DD", দুই প্রান্তই সহ
const myListQuerySchema = z
	.object({
		from: z.iso.date("from must be in YYYY-MM-DD format").optional(),
		to: z.iso.date("to must be in YYYY-MM-DD format").optional(),
	})
	.refine((data) => !data.from || !data.to || data.from <= data.to, {
		error: "from must be on or before to",
		path: ["from"],
	});

// GET /patient/appointments/periods?status=COMPLETED,CANCELLED → শুধু এই status-গুলোর বছর/মাস
const myPeriodsQuerySchema = z.object({
	status: z
		.string()
		.optional()
		.transform((value) => (value ? value.split(",").map((item) => item.trim().toUpperCase()) : undefined))
		.pipe(z.array(z.enum(AppointmentStatus, "status has an unknown value")).max(10).optional()),
});

export const AppointmentValidation = {
	bookAppointmentSchema,
	cancelAppointmentSchema,
	cancelMyAppointmentSchema,
	deskPaymentSchema,
	prescriptionSchema,
	listQuerySchema,
	myListQuerySchema,
	myPeriodsQuerySchema,
};
