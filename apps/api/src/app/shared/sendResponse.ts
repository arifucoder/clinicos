import type { Response } from "express";

export type TMeta = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};

type TSendResponse<T> = {
	statusCode: number;
	message: string;
	data?: T;
	meta?: TMeta;
};

export const sendResponse = <T>(res: Response, { statusCode, message, data, meta }: TSendResponse<T>) => {
	res.status(statusCode).json({
		success: true,
		message,
		...(meta && { meta }),
		data,
	});
};
