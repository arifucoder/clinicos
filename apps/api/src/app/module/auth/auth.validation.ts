import { emailSchema, personNameSchema } from "@/app/shared/commonValidation";
import * as z from "zod";

const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(128);
const otpSchema = z.string().regex(/^\d{6}$/, "Code must be exactly 6 digits");

const registerSchema = z.object({
	name: personNameSchema,
	email: emailSchema,
	password: passwordSchema,
});

const verifyEmailSchema = z.object({
	email: emailSchema,
	otp: otpSchema,
});

const resendOtpSchema = z.object({
	email: emailSchema,
});

const loginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "Password is required").max(128),
});

const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required").max(128),
		newPassword: passwordSchema,
	})
	.refine((data) => data.currentPassword !== data.newPassword, {
		path: ["newPassword"],
		message: "New password must be different from the current password",
	});

const forgetPasswordSchema = z.object({
	email: emailSchema,
});

const resetPasswordSchema = z.object({
	email: emailSchema,
	otp: otpSchema,
	newPassword: passwordSchema,
});

export const AuthValidation = {
	registerSchema,
	verifyEmailSchema,
	resendOtpSchema,
	loginSchema,
	changePasswordSchema,
	forgetPasswordSchema,
	resetPasswordSchema,
};
