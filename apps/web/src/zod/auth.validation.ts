import * as z from "zod";

const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address"));
const nameSchema = z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long");

export const registerSchema = z.object({
	name: nameSchema,
	email: emailSchema,
	password: passwordSchema,
});

export type RegisterPayload = z.infer<typeof registerSchema>;
