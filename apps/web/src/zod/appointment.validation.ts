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

// ---------- Doctor: Today's patients ----------
// URL: /doctor?tab=waiting&searchTerm=…&page=2&limit=20
export const DOCTOR_TODAY_TABS = ["waiting", "not-arrived", "completed"] as const;
export type DoctorTodayTab = (typeof DOCTOR_TODAY_TABS)[number];

export const DOCTOR_TODAY_PAGE_SIZES = [20, 50, 100] as const;

// sortOrder URL থেকে নেওয়া হয় না: কোন tab, সেটাই ঠিক করে (lib/doctorToday.ts)
export const doctorTodayQuerySchema = baseListQuerySchema.omit({ sortOrder: true }).extend({
	tab: z.enum(DOCTOR_TODAY_TABS).catch("waiting"),
	limit: z.coerce.number().int().min(1).max(100).catch(20),
});
export type DoctorTodayQuery = z.output<typeof doctorTodayQuerySchema>;

// ---------- Doctor: Appointment history ----------
// URL: /doctor/appointments?status=…&patientId=…&searchTerm=…&sortOrder=asc&page=2&limit=20
// EXPIRED বাদ: টাকা না দেওয়া hold, doctor-এর কাছে অর্থহীন। চলমানগুলো Today page-এ।
export const DOCTOR_HISTORY_STATUSES = [
	"COMPLETED",
	"NO_SHOW",
	"CANCELLED",
] as const satisfies readonly AppointmentStatus[];

export const DOCTOR_HISTORY_PAGE_SIZES = [20, 50, 100] as const;

export const doctorHistoryQuerySchema = baseListQuerySchema.extend({
	limit: z.coerce.number().int().min(1).max(100).catch(20),
	sortBy: z.enum(["startAt"]).catch("startAt"),
	sortOrder: z.enum(["asc", "desc"]).catch("desc"), // নতুনগুলো আগে
	status: z.enum(DOCTOR_HISTORY_STATUSES).optional().catch(undefined),
	// consultation-এর "View all visits" থেকে: এক রোগীর সব visit (api তবু শুধু এই doctor-এর দেয়)
	patientId: z.uuid().optional().catch(undefined),
});
export type DoctorHistoryQuery = z.output<typeof doctorHistoryQuerySchema>;

// ---------- Patient portal: My appointments ----------
// URL: /portal/appointments?tab=past&searchTerm=rahman&year=2026&month=11&sortOrder=asc&page=2   (Stripe ফেরত: ?payment=success&appointment=<id>)
export const PORTAL_APPOINTMENT_TABS = ["upcoming", "past"] as const;
export type PortalAppointmentTab = (typeof PORTAL_APPOINTMENT_TABS)[number];

export const PORTAL_APPOINTMENT_PAGE_SIZES = [10, 20, 50] as const;

// sortBy/sortOrder URL থেকে নেওয়া হয় না: tab ঠিক করে (lib/portalAppointments.ts)
export const portalAppointmentsQuerySchema = z.object({
	tab: z.enum(PORTAL_APPOINTMENT_TABS).catch("upcoming"),
	// api-র myAppointmentListConfig: doctor-এর নাম বা appointment no.
	searchTerm: z.string().trim().max(100).optional().catch(undefined),
	// বছর/মাস (clinic-এর calendar)। মাস শুধু বছরের সাথে মানে রাখে → page-এ বছর না থাকলে মাস বাদ
	year: z.coerce.number().int().min(2000).max(2100).optional().catch(undefined),
	month: z.coerce.number().int().min(1).max(12).optional().catch(undefined),
	// না দিলে tab ঠিক করে (upcoming = asc, past = desc)
	sortOrder: z.enum(["asc", "desc"]).optional().catch(undefined),
	page: z.coerce.number().int().min(1).catch(1),
	limit: z.coerce.number().int().min(1).max(50).catch(10),
	// api-র payment.stripe.ts-এর success_url / cancel_url
	payment: z.enum(["success", "cancelled"]).optional().catch(undefined),
	appointment: z.uuid().optional().catch(undefined),
});
export type PortalAppointmentsQuery = z.output<typeof portalAppointmentsQuerySchema>;

// api-র cancelMyAppointmentSchema-র সাথে মিল: reason ঐচ্ছিক, দিলে 3–200
export const cancelMyAppointmentSchema = z.object({
	reason: z
		.string()
		.trim()
		.max(200, "Keep the reason under 200 characters")
		.transform((value) => value || undefined) // খালি → পাঠাই না (api "Cancelled by patient" বসায়)
		.pipe(z.string().min(3, "Reason must be at least 3 characters").optional()),
});
export type CancelMyAppointmentPayload = z.output<typeof cancelMyAppointmentSchema>;

// ---------- Patient: নিজের booking (/portal/book?doctorId=…&slotId=…) ----------
export const myBookingPageQuerySchema = z.object({
	doctorId: z.uuid().optional().catch(undefined),
	slotId: z.uuid().optional().catch(undefined),
});

// api-র bookAppointmentSchema থেকে রোগী যা পাঠাতে পারে। patientId নেই: api session থেকে নেয় (IDOR-safe)
export const REASON_MAX = 500;
export const myBookingSchema = z.object({
	slotId: z.uuid("Pick a time first"),
	paymentMode: z.enum(["AT_DESK", "ONLINE"], { error: "Choose how you'll pay" }),
	reason: z
		.string()
		.trim()
		.min(2, "Reason must be at least 2 characters")
		.max(REASON_MAX, `Keep it under ${REASON_MAX} characters`)
		.optional(),
});
export type MyBookingPayload = z.output<typeof myBookingSchema>;
