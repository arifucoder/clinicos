"use server";

import { toActionError, zodFieldErrors } from "@/lib/actionError";
import { applyAuthCookies, clearAuthCookies } from "@/lib/authCookies";
import { getPostLoginRedirect } from "@/lib/authRedirect";
import { AuthService } from "@/services/auth.service";
import type { ActionError, ActionResult } from "@/types/api.types";
import {
	forgetPasswordSchema,
	loginSchema,
	registerSchema,
	resendOtpSchema,
	resetPasswordSchema,
	verifyEmailSchema,
} from "@/zod/auth.validation";
import { isAxiosError } from "axios";

// api-র handleBetterAuthError-এর EMAIL_NOT_VERIFIED message-এর সাথে হুবহু মিলতে হবে
const EMAIL_NOT_VERIFIED_MESSAGE = "Please verify your email before logging in";

// OTP-ভিত্তিক action-এর error: ৪২৯ → code, field error ছাড়া ৪০০ → ভুল/মেয়াদ শেষ code
const toOtpActionError = (error: unknown): ActionError => {
	const result = toActionError(error);
	if (!isAxiosError(error)) return result;

	const status = error.response?.status;
	if (status === 429) return { ...result, code: "TOO_MANY_ATTEMPTS" };
	if (status === 400 && !result.fieldErrors) return { ...result, fieldErrors: { otp: result.message } };

	return result;
};

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
		return toOtpActionError(error);
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

export async function forgetPasswordAction(input: unknown): Promise<ActionResult> {
	const parsed = forgetPasswordSchema.safeParse(input);
	if (!parsed.success) {
		return {
			success: false,
			message: "Please fix the highlighted fields.",
			fieldErrors: zodFieldErrors(parsed.error),
		};
	}

	try {
		const response = await AuthService.forgetPassword(parsed.data);
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toActionError(error);
	}
}

export async function resetPasswordAction(input: unknown): Promise<ActionResult> {
	const parsed = resetPasswordSchema.safeParse(input);
	if (!parsed.success) {
		return {
			success: false,
			message: "Please fix the highlighted fields.",
			fieldErrors: zodFieldErrors(parsed.error),
		};
	}

	try {
		const response = await AuthService.resetPassword(parsed.data);
		// api সব session বাতিল করেছে → এই browser-এর পুরনো cookie-ও মুছি
		await clearAuthCookies();
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toOtpActionError(error);
	}
}
