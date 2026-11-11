import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodType } from "zod";

export const validateRequest = (schema: ZodType): RequestHandler => {
	return async (req: Request, _res: Response, next: NextFunction) => {
		const result = await schema.safeParseAsync(req.body);

		if (!result.success) {
			// ZodError → globalErrorHandler → handleZodError → 400
			return next(result.error);
		}

		req.body = result.data;
		next();
	};
};
