import type { Appointment, AppointmentStatus, PaymentMethod } from "@/types/appointment.types";
import * as z from "zod";
import { baseListQuerySchema } from "./listQuery.validation";

export const PAYMENT_METHODS = ["CASH", "CARD", "MOBILE"] as const satisfies readonly PaymentMethod[];

export const appointmentIdSchema = z.uuid("Invalid appointment id");
export const paymentMethodSchema = z.enum(PAYMENT_METHODS, { error: "Choose how the fee was paid" });

// ---------- URL: /admin/front-desk/check-in?doctorId=…&show=all&searchTerm=0171&page=2 ----------
export const CHECK_IN_PAGE_SIZES = [20, 50, 100] as const;

export const checkInQuerySchema = baseListQuerySchema.extend({
	limit: z.coerce.number().int().min(1).max(100).catch(20),
	doctorId: z.uuid().optional().catch(undefined),
	// waiting = শুধু আসেননি (default); all = এসে গেছেন এমনও
	show: z.enum(["waiting", "all"]).catch("waiting"),
});
export type CheckInQuery = z.output<typeof checkInQuerySchema>;

// ---------- Book for patient ----------
export const BOOKING_DAYS = 14; // api-র SLOT_CONFIG.bookingWindowDays

// URL: /admin/front-desk/book?patientId=…&doctorId=…&date=…&slotId=…  (শেষে ?booked=<appointmentId>)
export const bookPageQuerySchema = z.object({
	searchTerm: z.string().trim().max(100).optional().catch(undefined),
	new: z.literal("1").optional().catch(undefined),
	patientId: z.uuid().optional().catch(undefined),
	doctorId: z.uuid().optional().catch(undefined),
	date: z.iso.date().optional().catch(undefined),
	slotId: z.uuid().optional().catch(undefined),
	booked: z.uuid().optional().catch(undefined),
});
export type BookPageQuery = z.output<typeof bookPageQuerySchema>;

// api-র bookAppointmentSchema-র সাথে মিল (একই দুই refine)
export const deskBookingSchema = z
	.object({
		patientId: z.uuid("Pick a patient first"),
		slotId: z.uuid("Pick a time first"),
		paymentMode: z.enum(["AT_DESK", "ONLINE"]),
		deskPaymentMethod: paymentMethodSchema.optional(),
		checkInNow: z.boolean().optional(),
		reason: z.string().trim().min(2, "Reason must be at least 2 characters").max(500).optional(),
	})
	.refine((data) => !data.deskPaymentMethod || data.paymentMode === "AT_DESK", {
		error: "Payment method works only with pay at desk",
		path: ["deskPaymentMethod"],
	})
	.refine((data) => !data.checkInNow || data.deskPaymentMethod, {
		error: "Collect the fee before checking in",
		path: ["checkInNow"],
	});
export type DeskBookingPayload = z.output<typeof deskBookingSchema>;

// ---------- Appointments list ----------
// URL: /admin/front-desk/appointments?date=…&doctorId=…&status=…&source=…&searchTerm=…&page=…
export const APPOINTMENT_STATUSES = [
	"PENDING_PAYMENT",
	"CONFIRMED",
	"CHECKED_IN",
	"COMPLETED",
	"CANCELLED",
	"NO_SHOW",
	"EXPIRED",
] as const satisfies readonly AppointmentStatus[];

export const APPOINTMENT_SOURCES = ["ONLINE", "STAFF"] as const satisfies readonly Appointment["source"][];

export const APPOINTMENT_PAGE_SIZES = [20, 50, 100] as const;

// api-র appointmentListConfig.sortableFields; default startAt asc (দিনের timeline)
export const APPOINTMENT_SORT_FIELDS = ["startAt", "createdAt", "appointmentNumber"] as const;

export const appointmentListQuerySchema = baseListQuerySchema.extend({
	limit: z.coerce.number().int().min(1).max(100).catch(20),
	sortBy: z.enum(APPOINTMENT_SORT_FIELDS).catch("startAt"),
	sortOrder: z.enum(["asc", "desc"]).catch("asc"),
	date: z.iso.date().optional().catch(undefined), // না থাকলে = আজ (page-এ ঠিক হয়)
	doctorId: z.uuid().optional().catch(undefined),
	status: z.enum(APPOINTMENT_STATUSES).optional().catch(undefined),
	source: z.enum(APPOINTMENT_SOURCES).optional().catch(undefined),
});
export type AppointmentListQuery = z.output<typeof appointmentListQuerySchema>;

// api-র cancelAppointmentSchema-র সাথে মিল (3–200)
export const cancelAppointmentSchema = z.object({
	reason: z
		.string()
		.trim()
		.min(3, "Reason must be at least 3 characters")
		.max(200, "Keep the reason under 200 characters"),
});
export type CancelAppointmentPayload = z.output<typeof cancelAppointmentSchema>;
