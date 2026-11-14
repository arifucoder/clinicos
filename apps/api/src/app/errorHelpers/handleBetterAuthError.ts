import type { APIError } from "better-auth/api";
import httpStatus from "http-status";
import type { TGenericErrorResponse } from "./error.interface";

const AUTH_ERRORS: Record<string, { statusCode: number; message: string }> = {
	INVALID_OTP: {
		statusCode: httpStatus.BAD_REQUEST,
		message: "Invalid verification code",
	},
	OTP_EXPIRED: {
		statusCode: httpStatus.BAD_REQUEST,
		message: "Verification code has expired. Request a new one",
	},
	TOO_MANY_ATTEMPTS: {
		statusCode: httpStatus.TOO_MANY_REQUESTS,
		message: "Too many wrong attempts. Request a new code",
	},
};

export const handleBetterAuthError = (err: APIError): TGenericErrorResponse => {
	const code = err.body?.code;
	const known = code ? AUTH_ERRORS[code] : undefined;

	if (known) {
		return { statusCode: known.statusCode, message: known.message, errorSources: [] };
	}

	if (err.statusCode >= 500) {
		return {
			statusCode: httpStatus.INTERNAL_SERVER_ERROR,
			message: "Something went wrong",
			errorSources: [],
		};
	}

	return {
		statusCode: err.statusCode,
		message: err.body?.message ?? "Request failed",
		errorSources: [],
	};
};
