import * as z from "zod";

export const STATS_RANGES = [7, 14, 30] as const;
export const DEFAULT_STATS_DAYS = 14;

export const adminStatsQuerySchema = z.object({
	days: z.coerce
		.number()
		.int()
		.refine((value) => (STATS_RANGES as readonly number[]).includes(value))
		.catch(DEFAULT_STATS_DAYS),
});
