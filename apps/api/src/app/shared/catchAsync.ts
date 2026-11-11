import type { NextFunction, Request, RequestHandler, Response } from "express";

type TAsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const catchAsync =
	(fn: TAsyncHandler): RequestHandler =>
	(req, res, next) => {
		fn(req, res, next).catch(next);
	};
