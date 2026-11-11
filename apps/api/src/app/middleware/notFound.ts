import { AppError } from "@/app/errorHelpers/AppError";
import type { RequestHandler } from "express";
import httpStatus from "http-status";

export const notFound: RequestHandler = (req, _res, next) => {
	next(new AppError(httpStatus.NOT_FOUND, `Route ${req.method} ${req.originalUrl} not found`));
};
