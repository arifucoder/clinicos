import * as z from "zod";

// Admin chart কত দিনের (default ১৪, সর্বোচ্চ ৯০)
const adminStatsQuerySchema = z.object({
	days: z.coerce.number().int().min(1, "days must be at least 1").max(90, "days can be at most 90").default(14),
});

export const StatsValidation = { adminStatsQuerySchema };
