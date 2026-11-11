import type { Prisma } from "@/generated/prisma/client";
import httpStatus from "http-status";
import type { TGenericErrorResponse } from "./error.interface";

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const toStringArray = (value: unknown): string[] =>
	Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const getUniqueFields = (meta: Record<string, unknown> | undefined): string[] => {
	// Prisma 7 + driver adapter (pg): meta.driverAdapterError.cause.constraint.fields
	const adapterError = meta?.driverAdapterError;
	if (isRecord(adapterError) && isRecord(adapterError.cause) && isRecord(adapterError.cause.constraint)) {
		const fields = toStringArray(adapterError.cause.constraint.fields);
		if (fields.length) return fields;
	}
	return toStringArray(meta?.target);
};

export const handlePrismaKnownError = (err: Prisma.PrismaClientKnownRequestError): TGenericErrorResponse => {
	switch (err.code) {
		case "P2002": {
			const fields = getUniqueFields(err.meta);
			const label = fields.length ? fields.join(", ") : "value";
			return {
				statusCode: httpStatus.CONFLICT,
				message: `Duplicate ${label}`,
				errorSources: fields.map((field) => ({ path: field, message: `${field} already exists` })),
			};
		}
		case "P2003":
			return {
				statusCode: httpStatus.BAD_REQUEST,
				message: "Related record does not exist or is still in use",
				errorSources: [],
			};
		case "P2025":
			return {
				statusCode: httpStatus.NOT_FOUND,
				message: "Record not found",
				errorSources: [],
			};
		case "P2000":
			return {
				statusCode: httpStatus.BAD_REQUEST,
				message: "Value is too long for the field",
				errorSources: [],
			};
		default:
			return {
				statusCode: httpStatus.INTERNAL_SERVER_ERROR,
				message: "Database error",
				errorSources: [],
			};
	}
};

export const handlePrismaValidationError = (): TGenericErrorResponse => ({
	statusCode: httpStatus.BAD_REQUEST,
	message: "Invalid data sent to database",
	errorSources: [],
});
