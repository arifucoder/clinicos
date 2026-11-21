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

const otpSchema = z.string().regex(/^\d{6}$/, "Enter the 6-digit code");

export const verifyEmailSchema = z.object({
	email: emailSchema,
	otp: otpSchema,
});

export const resendOtpSchema = z.object({
	email: emailSchema,
});

export type VerifyEmailPayload = z.infer<typeof verifyEmailSchema>;
export type ResendOtpPayload = z.infer<typeof resendOtpSchema>;

export const loginSchema = z.object({
	email: emailSchema,
	// এখানে min 8 না: login শুধু মিলিয়ে দেখে, নতুন নিয়ম চাপায় না (api-ও min 1)
	password: z.string().min(1, "Password is required").max(128, "Password is too long"),
});

export type LoginPayload = z.infer<typeof loginSchema>;

export const forgetPasswordSchema = z.object({
	email: emailSchema,
});

// action-এ যায় — api-র resetPasswordSchema-র সাথে হুবহু মিল
export const resetPasswordSchema = z.object({
	email: emailSchema,
	otp: otpSchema,
	newPassword: passwordSchema,
});

// শুধু form-এর জন্য: confirmPassword কখনো server-এ যায় না
export const resetPasswordFormSchema = z
	.object({
		otp: otpSchema,
		newPassword: passwordSchema,
		confirmPassword: z.string().min(1, "Confirm your new password"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords don't match",
	});

export type ForgetPasswordPayload = z.infer<typeof forgetPasswordSchema>;
export type ResetPasswordPayload = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
