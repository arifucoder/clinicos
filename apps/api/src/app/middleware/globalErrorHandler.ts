import { AppError } from "@/app/errorHelpers/AppError";
import type { TGenericErrorResponse } from "@/app/errorHelpers/error.interface";
import { handlePrismaKnownError, handlePrismaValidationError } from "@/app/errorHelpers/handlePrismaError";
import { handleZodError } from "@/app/errorHelpers/handleZodError";
import { Prisma } from "@/generated/prisma/client";
import type { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import { envVars } from "../config/env";

const isDev = envVars.NODE_ENV === "development";

export const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
	let errorResponse: TGenericErrorResponse = {
		statusCode: httpStatus.INTERNAL_SERVER_ERROR,
		message: "Something went wrong",
		errorSources: [],
	};

	if (err instanceof ZodError) {
		errorResponse = handleZodError(err);
	} else if (err instanceof Prisma.PrismaClientKnownRequestError) {
		errorResponse = handlePrismaKnownError(err);
	} else if (err instanceof Prisma.PrismaClientValidationError) {
		errorResponse = handlePrismaValidationError();
	} else if (err instanceof AppError) {
		errorResponse = { statusCode: err.statusCode, message: err.message, errorSources: [] };
	} else if (err instanceof Error && isDev) {
		errorResponse.message = err.message;
	}

	if (errorResponse.statusCode >= 500) console.error(err);

	res.status(errorResponse.statusCode).json({
		success: false,
		message: errorResponse.message,
		errorSources: errorResponse.errorSources,
		...(isDev && err instanceof Error && { stack: err.stack }),
	});
};
