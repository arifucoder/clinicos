import { personNameSchema, phoneSchema } from "@/app/shared/commonValidation";
import * as z from "zod";

const updateDoctorSchema = z
	.object({
		name: personNameSchema.optional(),
		phone: phoneSchema.nullable().optional(),
		specialtyIds: z
			.array(z.uuid("Invalid specialty id"))
			.min(1, "Select at least one specialty")
			.max(5, "A doctor can have at most 5 specialties")
			.transform((ids) => [...new Set(ids)])
			.optional(),
		licenseNumber: z.string().trim().toUpperCase().min(3, "License number is too short").max(50).optional(),
		consultationFeeCents: z.number().int("Fee must be in whole cents").min(0).max(10_000_000).optional(),
		roomNumber: z.string().trim().max(20).nullable().optional(),
		bio: z.string().trim().max(1000).nullable().optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		error: "Provide at least one field to update",
	});

const updateDoctorStatusSchema = z.object({
	isActive: z.boolean(),
});

export const DoctorValidation = {
	updateDoctorSchema,
	updateDoctorStatusSchema,
};
