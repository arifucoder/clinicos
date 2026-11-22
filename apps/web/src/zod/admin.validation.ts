import * as z from "zod";
import { baseListQuerySchema, sortBySchema } from "./listQuery.validation";

// api-র commonValidation.ts-এর সাথে মিল
const nameSchema = z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long");
const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address"));
// form-এ phone optional: "" চলবে, নইলে 6–20 অক্ষর
const phoneSchema = z
	.string()
	.trim()
	.max(20, "Phone number is too long")
	.refine((value) => value === "" || value.length >= 6, { error: "Phone number is too short" });

// ---------- Form (browser) ----------
export const adminCreateFormSchema = z.object({ name: nameSchema, email: emailSchema, phone: phoneSchema });
export const adminEditFormSchema = z.object({ name: nameSchema, phone: phoneSchema }); // email বদলানো যায় না
export type AdminCreateFormValues = z.input<typeof adminCreateFormSchema>;
export type AdminEditFormValues = z.input<typeof adminEditFormSchema>;

// ---------- Action (server): api যে আকার চায় ----------
export const createAdminSchema = z.object({
	name: nameSchema,
	email: emailSchema,
	phone: phoneSchema.optional().transform((value) => value || undefined),
});

export const updateAdminSchema = z
	.object({
		name: nameSchema.optional(),
		// "" → null (মুছে ফেলো), না এলে → undefined (বদলাবে না)
		phone: phoneSchema.optional().transform((value) => (value === undefined ? undefined : value || null)),
	})
	.refine((data) => Object.values(data).some((value) => value !== undefined), { error: "Nothing to update" });

export type CreateAdminPayload = z.output<typeof createAdminSchema>;
export interface UpdateAdminPayload {
	name?: string;
	phone?: string | null;
}

export const adminIdSchema = z.uuid("Invalid admin id");

// ---------- URL ----------
export const STAFF_PAGE_SIZES = [10, 20, 50] as const;

export const adminListQuerySchema = baseListQuerySchema.extend({
	sortBy: sortBySchema(["createdAt", "name"]), // api-র adminListConfig.sortableFields
	isActive: z.enum(["true", "false"]).optional().catch(undefined),
});
export type AdminListQuery = z.output<typeof adminListQuerySchema>;
