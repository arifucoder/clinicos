import * as z from "zod";

// api-র commonValidation.ts-এর সাথে মিল। admin, doctor (পরে patient) সবাই এখান থেকে নেয়।
export const nameSchema = z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long");
export const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address"));
// form-এ phone optional: "" চলবে, নইলে 6–20 অক্ষর
export const phoneSchema = z
	.string()
	.trim()
	.max(20, "Phone number is too long")
	.refine((value) => value === "" || value.length >= 6, { error: "Phone number is too short" });

// create: "" → undefined (field পাঠাবই না)
export const omitEmpty = (schema: z.ZodType<string>) => schema.optional().transform((value) => value || undefined);

// update: "" → null (মুছে ফেলো), field না এলে → undefined (বদলাবে না)
export const clearable = (schema: z.ZodType<string>) =>
	schema.optional().transform((value) => (value === undefined ? undefined : value || null));
