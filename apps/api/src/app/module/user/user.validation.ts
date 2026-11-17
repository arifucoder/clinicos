import { emailSchema, personNameSchema, phoneSchema } from "@/app/shared/commonValidation";
import * as z from "zod";

const createAdminSchema = z.object({
	name: personNameSchema,
	email: emailSchema,
	phone: phoneSchema.optional(),
});

const createDoctorSchema = z.object({
	name: personNameSchema,
	email: emailSchema,
	phone: phoneSchema.optional(),
	specialtyIds: z
		.array(z.uuid("Invalid specialty id"))
		.min(1, "Select at least one specialty")
		.max(5, "A doctor can have at most 5 specialties")
		.transform((ids) => [...new Set(ids)]),
	licenseNumber: z.string().trim().toUpperCase().min(3, "License number is too short").max(50),
	consultationFeeCents: z.number().int("Fee must be in whole cents").min(0).max(10_000_000),
	roomNumber: z.string().trim().max(20).optional(),
	bio: z.string().trim().max(1000).optional(),
});

export const UserValidation = {
	createAdminSchema,
	createDoctorSchema,
};
