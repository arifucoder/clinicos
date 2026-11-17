import { personNameSchema, phoneSchema } from "@/app/shared/commonValidation";
import * as z from "zod";

const updateAdminSchema = z
	.object({
		name: personNameSchema.optional(),
		phone: phoneSchema.nullable().optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		error: "Provide at least one field to update",
	});

const updateAdminStatusSchema = z.object({
	isActive: z.boolean(),
});

export const AdminValidation = {
	updateAdminSchema,
	updateAdminStatusSchema,
};
