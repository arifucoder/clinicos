import * as z from "zod";

export const idParamSchema = z.object({ id: z.uuid("Invalid id") });
export const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Invalid email address"));
export const personNameSchema = z.string().trim().min(2, "Name must be at least 2 characters").max(100);
export const phoneSchema = z.string().trim().min(6, "Phone number is too short").max(20);
export const dateOfBirthSchema = z.iso
	.date("Date of birth must be in YYYY-MM-DD format")
	.refine((value) => new Date(value) <= new Date(), { error: "Date of birth cannot be in the future" })
	.transform((value) => new Date(value));
