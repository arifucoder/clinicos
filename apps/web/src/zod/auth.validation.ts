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
	password: z.string().min(1, "Password is required").max(128, "Password is too long"),
});

export type LoginPayload = z.infer<typeof loginSchema>;

export const forgetPasswordSchema = z.object({
	email: emailSchema,
});

export const resetPasswordSchema = z.object({
	email: emailSchema,
	otp: otpSchema,
	newPassword: passwordSchema,
});

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

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required").max(128, "Password is too long"),
		newPassword: passwordSchema,
	})
	.refine((data) => data.currentPassword !== data.newPassword, {
		path: ["newPassword"],
		message: "New password must be different from the current password",
	});

export const changePasswordFormSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required").max(128, "Password is too long"),
		newPassword: passwordSchema,
		confirmPassword: z.string().min(1, "Confirm your new password"),
	})
	.refine((data) => data.currentPassword !== data.newPassword, {
		path: ["newPassword"],
		message: "New password must be different from the current password",
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords don't match",
	});

export type ChangePasswordPayload = z.infer<typeof changePasswordSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;
