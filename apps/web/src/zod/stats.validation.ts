import * as z from "zod";

// UI-তে যে range-গুলো দেখাই। api ১–৯০ নেয়, আমরা শুধু এই তিনটা দিই।
export const STATS_RANGES = [7, 14, 30] as const;
export const DEFAULT_STATS_DAYS = 14;

// URL-এ ভুল মান (?days=abc বা 500) এলে crash না করে default বসবে (listQuery-র মতো .catch)
export const adminStatsQuerySchema = z.object({
	days: z.coerce
		.number()
		.int()
		.refine((value) => (STATS_RANGES as readonly number[]).includes(value))
		.catch(DEFAULT_STATS_DAYS),
});
