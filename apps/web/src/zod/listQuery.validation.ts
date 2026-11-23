import * as z from "zod";

export const DEFAULT_SORT_BY = "createdAt";
export const DEFAULT_SORT_ORDER = "desc";

export const baseListQuerySchema = z.object({
	page: z.coerce.number().int().min(1).catch(1),
	limit: z.coerce.number().int().min(1).max(100).catch(10),
	searchTerm: z.string().trim().max(100).optional().catch(undefined),
	sortOrder: z.enum(["asc", "desc"]).catch(DEFAULT_SORT_ORDER),
});

export const sortBySchema = <const T extends readonly [typeof DEFAULT_SORT_BY, ...string[]]>(fields: T) =>
	z.enum(fields).catch(DEFAULT_SORT_BY);
