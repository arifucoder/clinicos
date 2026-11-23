import { clinicToday } from "@/lib/clinicDate";
import type { BloodGroup, Gender } from "@/types/patient.types";
import * as z from "zod";
import { clearable, emailSchema, nameSchema, omitEmpty, phoneSchema } from "./common.validation";
import { baseListQuerySchema, sortBySchema } from "./listQuery.validation";
export const GENDERS = ["MALE", "FEMALE", "OTHER"] as const satisfies readonly Gender[];
export const BLOOD_GROUPS = [
	"A_POSITIVE",
	"A_NEGATIVE",
	"B_POSITIVE",
	"B_NEGATIVE",
	"AB_POSITIVE",
	"AB_NEGATIVE",
	"O_POSITIVE",
	"O_NEGATIVE",
] as const satisfies readonly BloodGroup[];

const requiredPhoneSchema = z.string().trim().min(6, "Phone number is too short").max(20, "Phone number is too long");
const optionalNameSchema = z
	.string()
	.trim()
	.max(100, "Name is too long")
	.refine((value) => value === "" || value.length >= 2, { error: "Name must be at least 2 characters" });
const addressSchema = z.string().trim().max(300, "Keep the address under 300 characters");
const allergiesSchema = z.string().trim().max(500, "Keep allergies under 500 characters");
const dateOfBirthSchema = z.iso
	.date("Enter a valid date of birth")
	.refine((value) => value <= clinicToday(new Date()), { error: "Date of birth can't be in the future" });

export const patientFormSchema = z.object({
	fullName: nameSchema,
	email: emailSchema,
	phone: requiredPhoneSchema,
	dateOfBirth: dateOfBirthSchema,
	gender: z
		.enum(GENDERS)
		.or(z.literal(""))
		.refine((value) => value !== "", { error: "Select a gender" }),
	address: addressSchema,
	bloodGroup: z.enum(BLOOD_GROUPS).or(z.literal("")),
	allergies: allergiesSchema,
	emergencyContactName: optionalNameSchema,
	emergencyContactPhone: phoneSchema,
});
export type PatientFormValues = z.input<typeof patientFormSchema>;

export const createPatientSchema = z.object({
	fullName: nameSchema,
	email: emailSchema,
	phone: requiredPhoneSchema,
	dateOfBirth: dateOfBirthSchema,
	gender: z.enum(GENDERS, { error: "Select a gender" }),
	address: omitEmpty(addressSchema),
	bloodGroup: z
		.enum(BLOOD_GROUPS)
		.or(z.literal(""))
		.optional()
		.transform((value) => value || undefined),
	allergies: omitEmpty(allergiesSchema),
	emergencyContactName: omitEmpty(optionalNameSchema),
	emergencyContactPhone: omitEmpty(phoneSchema),
});
export type CreatePatientPayload = z.output<typeof createPatientSchema>;

export const PATIENT_PAGE_SIZES = [10, 20, 50] as const;

export const patientListQuerySchema = baseListQuerySchema.extend({
	sortBy: sortBySchema(["createdAt", "fullName", "dateOfBirth"]),
	isActive: z.enum(["true", "false"]).optional().catch(undefined),
	gender: z.enum(GENDERS).optional().catch(undefined),
	bloodGroup: z.enum(BLOOD_GROUPS).optional().catch(undefined),
});
export type PatientListQuery = z.output<typeof patientListQuerySchema>;

export const patientIdSchema = z.uuid("Invalid patient id");

const requiredGenderSchema = z
	.enum(GENDERS)
	.or(z.literal(""))
	.refine((value) => value !== "", { error: "Select a gender" });

export const myPatientProfileFormSchema = z.object({
	phone: requiredPhoneSchema,
	dateOfBirth: dateOfBirthSchema,
	gender: requiredGenderSchema,
	address: addressSchema,
	bloodGroup: z.enum(BLOOD_GROUPS).or(z.literal("")),
	emergencyContactName: optionalNameSchema,
	emergencyContactPhone: phoneSchema,
});
export type MyPatientProfileFormValues = z.input<typeof myPatientProfileFormSchema>;

export const updateMyPatientProfileSchema = z.object({
	phone: requiredPhoneSchema,
	dateOfBirth: dateOfBirthSchema,
	gender: z.enum(GENDERS, { error: "Select a gender" }),
	address: clearable(addressSchema),
	bloodGroup: z
		.enum(BLOOD_GROUPS)
		.or(z.literal(""))
		.optional()
		.transform((value) => (value === undefined ? undefined : value || null)),
	emergencyContactName: clearable(optionalNameSchema),
	emergencyContactPhone: clearable(phoneSchema),
});
export type UpdateMyPatientProfilePayload = z.output<typeof updateMyPatientProfileSchema>;
