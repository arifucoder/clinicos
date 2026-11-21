"use server";

import { toActionError, zodFieldErrors } from "@/lib/actionError";
import { AuthService } from "@/services/auth.service";
import type { ActionResult } from "@/types/api.types";
import { registerSchema } from "@/zod/auth.validation";
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
