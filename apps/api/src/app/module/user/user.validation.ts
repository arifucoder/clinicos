import { emailSchema, personNameSchema, phoneSchema } from "@/app/shared/commonValidation";
import * as z from "zod";

const createAdminSchema = z.object({
	name: personNameSchema,
	email: emailSchema,
	phone: phoneSchema.optional(),
});

export const UserValidation = {
	createAdminSchema,
};
