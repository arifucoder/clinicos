"use server";

import { toActionError, zodFieldErrors } from "@/lib/actionError";
import { applyAuthCookies } from "@/lib/authCookies";
import { getPostLoginRedirect } from "@/lib/authRedirect";
import { AuthService } from "@/services/auth.service";
import type { ActionResult } from "@/types/api.types";
import { loginSchema, registerSchema, resendOtpSchema, verifyEmailSchema } from "@/zod/auth.validation";
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

// api-র handleBetterAuthError-এর EMAIL_NOT_VERIFIED message-এর সাথে হুবহু মিলতে হবে
const EMAIL_NOT_VERIFIED_MESSAGE = "Please verify your email before logging in";

export async function loginAction(input: unknown, next?: unknown): Promise<ActionResult<{ redirectTo: string }>> {
	const parsed = loginSchema.safeParse(input);
	if (!parsed.success) {
		return {
			success: false,
			message: "Please fix the highlighted fields.",
			fieldErrors: zodFieldErrors(parsed.error),
		};
	}

	try {
		const { data: response, setCookies } = await AuthService.login(parsed.data);

		const applied = await applyAuthCookies(setCookies);
		if (applied === 0) {
			console.error("[loginAction] login succeeded but no auth cookies were returned");
			return { success: false, message: "Something went wrong. Please try again." };
		}

		const user = response.data;
		const redirectTo = user.needPasswordChange ? "/change-password" : getPostLoginRedirect(user.role, next);

		return { success: true, message: response.message, data: { redirectTo } };
	} catch (error) {
		if (isAxiosError(error)) {
			const status = error.response?.status;

			// কোনটা ভুল (email না password) বলি না — user enumeration ঠেকাতে
			if (status === 401) {
				return { success: false, message: "Email or password is incorrect." };
			}
			if (status === 403 && error.response?.data?.message === EMAIL_NOT_VERIFIED_MESSAGE) {
				return { success: false, message: EMAIL_NOT_VERIFIED_MESSAGE, code: "EMAIL_NOT_VERIFIED" };
			}
		}
		return toActionError(error);
	}
}
