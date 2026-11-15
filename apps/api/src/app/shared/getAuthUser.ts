import type { TAuthPayload } from "@/app/utils/token";
import type { Request } from "express";

export const getAuthUser = (req: Request): TAuthPayload => {
	if (!req.user) {
		throw new Error("getAuthUser called on a route without checkAuth");
	}

	return req.user;
};
