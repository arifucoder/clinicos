"use server";

import { toActionError, zodFieldErrors } from "@/lib/actionError";
import { AuthService } from "@/services/auth.service";
import type { ActionResult } from "@/types/api.types";
import { registerSchema, resendOtpSchema, verifyEmailSchema } from "@/zod/auth.validation";
import { isAxiosError } from "axios";

export async function registerAction(input: unknown): Promise<ActionResult> {
	// Server Action আসলে একটা public POST endpoint, তাই client-এর data বিশ্বাস করা যায় না
	const parsed = registerSchema.safeParse(input);
	if (!parsed.success) {
		return {
			success: false,
			message: "Please fix the highlighted fields.",
			fieldErrors: zodFieldErrors(parsed.error),
		};
	}

	try {
		const response = await AuthService.registerPatient(parsed.data);
		return { success: true, message: response.message, data: null };
	} catch (error) {
		if (isAxiosError(error) && error.response?.status === 409) {
			return {
				success: false,
				message: "An account with this email already exists.",
				fieldErrors: { email: "An account with this email already exists. Try logging in instead." },
			};
		}
		return toActionError(error);
	}
}

export async function verifyEmailAction(input: unknown): Promise<ActionResult> {
	const parsed = verifyEmailSchema.safeParse(input);
	if (!parsed.success) {
		return {
			success: false,
			message: "Please enter the 6-digit code.",
			fieldErrors: zodFieldErrors(parsed.error),
		};
	}

	try {
		const response = await AuthService.verifyEmail(parsed.data);
		return { success: true, message: response.message, data: null };
	} catch (error) {
		const result = toActionError(error);
		// ভুল বা মেয়াদ শেষ code (400) → OTP box-এর নিচে দেখাবে
		if (isAxiosError(error) && error.response?.status === 400) {
			return { ...result, fieldErrors: { otp: result.message } };
		}
		return result;
	}
}

export async function resendOtpAction(input: unknown): Promise<ActionResult> {
	const parsed = resendOtpSchema.safeParse(input);
	if (!parsed.success) {
		return { success: false, message: "This link is missing a valid email address." };
	}

	try {
		const response = await AuthService.resendOtp(parsed.data);
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toActionError(error);
	}
}
