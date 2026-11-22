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
