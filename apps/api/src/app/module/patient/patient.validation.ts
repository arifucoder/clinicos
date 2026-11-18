import { dateOfBirthSchema, personNameSchema, phoneSchema } from "@/app/shared/commonValidation";
import { BloodGroup, Gender } from "@/generated/prisma/enums";
import * as z from "zod";

const updateMyProfileSchema = z
	.object({
		phone: phoneSchema.optional(),
		dateOfBirth: dateOfBirthSchema.optional(),
		gender: z.enum(Gender).optional(),
		address: z.string().trim().max(300).nullable().optional(),
		bloodGroup: z.enum(BloodGroup).nullable().optional(),
		emergencyContactName: personNameSchema.nullable().optional(),
		emergencyContactPhone: phoneSchema.nullable().optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		error: "Provide at least one field to update",
	});

export const PatientValidation = {
	updateMyProfileSchema,
};
