import * as z from "zod";

// সব list page-এর নিয়ম: default-এ নতুনগুলো আগে (createdAt desc)।
// URL-এ ভুল বা খালি value এলে crash না করে এই default-গুলো বসে।
export const DEFAULT_SORT_BY = "createdAt";
export const DEFAULT_SORT_ORDER = "desc";

export const baseListQuerySchema = z.object({
	page: z.coerce.number().int().min(1).catch(1),
	limit: z.coerce.number().int().min(1).max(100).catch(10),
	searchTerm: z.string().trim().max(100).optional().catch(undefined),
	sortOrder: z.enum(["asc", "desc"]).catch(DEFAULT_SORT_ORDER),
});

// প্রতিটা module নিজের sortable field দেয়; "createdAt" থাকতেই হবে (default ওটাই)
export const sortBySchema = <const T extends readonly [typeof DEFAULT_SORT_BY, ...string[]]>(fields: T) =>
	z.enum(fields).catch(DEFAULT_SORT_BY);
