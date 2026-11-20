import httpStatus from "http-status";
import type { MulterError } from "multer";
import type { TGenericErrorResponse } from "./error.interface";

const messages: Partial<Record<MulterError["code"], string>> = {
	LIMIT_FILE_SIZE: "Photo must be 2 MB or smaller",
	LIMIT_FILE_COUNT: "Upload only one photo",
	LIMIT_UNEXPECTED_FILE: 'Send the photo in the "photo" form field',
};

export const handleMulterError = (err: MulterError): TGenericErrorResponse => ({
	statusCode: httpStatus.BAD_REQUEST,
	message: messages[err.code] ?? err.message,
	errorSources: [],
});
