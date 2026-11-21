import "server-only";

import type { ActionError, ApiErrorResponse } from "@/types/api.types";
import { isAxiosError } from "axios";
import type * as z from "zod";

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

// Zod issue → { field: "first message" }
export const zodFieldErrors = (error: z.ZodError): Record<string, string> => {
	const fieldErrors: Record<string, string> = {};
	for (const issue of error.issues) {
		const key = String(issue.path[0] ?? "root");
		fieldErrors[key] ??= issue.message;
	}
	return fieldErrors;
};

// যেকোনো error → client-এর জন্য নিরাপদ, একই আকারের result
export const toActionError = (error: unknown): ActionError => {
	if (isAxiosError<ApiErrorResponse>(error)) {
		const response = error.response;

		if (!response) {
			return { success: false, message: "Can't reach the server. Please check your connection and try again." };
		}

		if (response.status === 429) {
			return { success: false, message: "Too many attempts. Please wait a few minutes and try again." };
		}

		const fieldErrors: Record<string, string> = {};
		for (const source of response.data?.errorSources ?? []) {
			fieldErrors[source.path] ??= source.message;
		}

		return {
			success: false,
			message: response.data?.message ?? FALLBACK_MESSAGE,
			fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
		};
	}

	console.error(error);
	return { success: false, message: FALLBACK_MESSAGE };
};
