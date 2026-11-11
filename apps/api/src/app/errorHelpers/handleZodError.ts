import httpStatus from "http-status";
import type { ZodError } from "zod";
import type { TGenericErrorResponse } from "./error.interface";

export const handleZodError = (err: ZodError): TGenericErrorResponse => ({
	statusCode: httpStatus.BAD_REQUEST,
	message: "Validation failed",
	errorSources: err.issues.map((issue) => ({
		path: issue.path.map(String).join(".") || "root",
		message: issue.message,
	})),
});
