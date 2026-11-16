import { envVars } from "@/app/config/env";
import { AppError } from "@/app/errorHelpers/AppError";
import { Role } from "@/generated/prisma/enums";
import httpStatus from "http-status";
import * as z from "zod";
import { durationToSeconds } from "./duration";
import { jwtUtils } from "./jwt";

const authPayloadSchema = z.object({
	userId: z.uuid(),
	role: z.enum(Role),
});

export type TAuthPayload = z.infer<typeof authPayloadSchema>;

const ACCESS_TOKEN_EXPIRES_IN = durationToSeconds(envVars.ACCESS_TOKEN_EXPIRES_IN);
const REFRESH_TOKEN_EXPIRES_IN = durationToSeconds(envVars.REFRESH_TOKEN_EXPIRES_IN);

const getAccessToken = ({ userId, role }: TAuthPayload): string => {
	return jwtUtils.createToken({ userId, role }, envVars.ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRES_IN);
};

const getRefreshToken = ({ userId, role }: TAuthPayload): string => {
	return jwtUtils.createToken({ userId, role }, envVars.REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRES_IN);
};

const parseAuthPayload = (decoded: unknown): TAuthPayload => {
	const parsed = authPayloadSchema.safeParse(decoded);

	if (!parsed.success) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token payload");
	}

	return parsed.data;
};

const verifyAccessToken = (token: string): TAuthPayload => {
	return parseAuthPayload(jwtUtils.verifyToken(token, envVars.ACCESS_TOKEN_SECRET));
};

const verifyRefreshToken = (token: string): TAuthPayload => {
	return parseAuthPayload(jwtUtils.verifyToken(token, envVars.REFRESH_TOKEN_SECRET));
};

export const tokenUtils = {
	getAccessToken,
	getRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
};
