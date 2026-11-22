import * as z from "zod";
import { baseListQuerySchema, sortBySchema } from "./listQuery.validation";

// api-র specialty.validation.ts-এর সাথে হুবহু মিল
const nameSchema = z
	.string()
	.trim()
	.min(2, "Name must be at least 2 characters")
	.max(100, "Name is too long")
	.regex(/[a-z0-9]/i, "Name must contain letters or numbers");
const descriptionSchema = z.string().trim().max(500, "Keep the description under 500 characters");
const iconSchema = z.string().trim().max(255, "Icon name is too long");

// ---------- Form (browser): সব field string, খালি হলে "" ----------
export const specialtyFormSchema = z.object({
	name: nameSchema,
	description: descriptionSchema,
	icon: iconSchema,
});
export type SpecialtyFormValues = z.input<typeof specialtyFormSchema>;

// ---------- Action (server): api যে আকার চায় ----------
// create: খালি field পাঠাবই না
export const createSpecialtySchema = z.object({
	name: nameSchema,
	description: descriptionSchema.optional().transform((value) => value || undefined),
	icon: iconSchema.optional().transform((value) => value || undefined),
});

// update: "" মানে মুছে ফেলো → null; field না এলে → undefined (বদলাবে না)
const clearable = (schema: z.ZodString) =>
	schema.optional().transform((value) => (value === undefined ? undefined : value || null));

export const updateSpecialtySchema = z
	.object({
		name: nameSchema.optional(),
		description: clearable(descriptionSchema),
		icon: clearable(iconSchema),
		isActive: z.boolean().optional(),
	})
	.refine((data) => Object.values(data).some((value) => value !== undefined), {
		error: "Nothing to update",
	});

export type CreateSpecialtyPayload = z.output<typeof createSpecialtySchema>;
export interface UpdateSpecialtyPayload {
	name?: string;
	description?: string | null;
	icon?: string | null;
	isActive?: boolean;
}

export const specialtyIdSchema = z.uuid("Invalid specialty id");

// ---------- URL (?page=2&sortBy=name …) ----------
export const SPECIALTY_PAGE_SIZES = [10, 20, 50] as const;

export const specialtyListQuerySchema = baseListQuerySchema.extend({
	sortBy: sortBySchema(["createdAt", "name"]),
	isActive: z.enum(["true", "false"]).optional().catch(undefined),
});
export type SpecialtyListQuery = z.output<typeof specialtyListQuerySchema>;
