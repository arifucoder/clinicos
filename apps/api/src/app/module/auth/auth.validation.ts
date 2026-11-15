import * as z from "zod";

const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Invalid email address"));

const registerSchema = z.object({
	name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
	email: emailSchema,
	password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

const verifyEmailSchema = z.object({
	email: emailSchema,
	otp: z.string().regex(/^\d{6}$/, "Code must be exactly 6 digits"),
});

const resendOtpSchema = z.object({
	email: emailSchema,
});

const loginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "Password is required").max(128),
});

export const AuthValidation = {
	registerSchema,
	verifyEmailSchema,
	resendOtpSchema,
	loginSchema,
};
