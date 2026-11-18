import { dateOfBirthSchema, emailSchema, personNameSchema, phoneSchema } from "@/app/shared/commonValidation";
import { BloodGroup, Gender } from "@/generated/prisma/enums";
import * as z from "zod";

const addressSchema = z.string().trim().max(300);
const allergiesSchema = z.string().trim().max(500);

const createPatientSchema = z.object({
	fullName: personNameSchema,
	email: emailSchema,
	phone: phoneSchema,
	dateOfBirth: dateOfBirthSchema,
	gender: z.enum(Gender),
	address: addressSchema.optional(),
	bloodGroup: z.enum(BloodGroup).optional(),
	allergies: allergiesSchema.optional(),
	emergencyContactName: personNameSchema.optional(),
	emergencyContactPhone: phoneSchema.optional(),
});

const updatePatientSchema = z
	.object({
		fullName: personNameSchema.optional(),
		phone: phoneSchema.optional(),
		dateOfBirth: dateOfBirthSchema.optional(),
		gender: z.enum(Gender).optional(),
		address: addressSchema.nullable().optional(),
		bloodGroup: z.enum(BloodGroup).nullable().optional(),
		allergies: allergiesSchema.nullable().optional(),
		emergencyContactName: personNameSchema.nullable().optional(),
		emergencyContactPhone: phoneSchema.nullable().optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		error: "Provide at least one field to update",
	});

const updateAccountStatusSchema = z.object({
	isActive: z.boolean(),
});

export const PatientRecordValidation = {
	createPatientSchema,
	updatePatientSchema,
	updateAccountStatusSchema,
};
