import type { PaymentMethod } from "@/types/appointment.types";
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
