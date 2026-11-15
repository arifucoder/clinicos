import { envVars, isProduction } from "@/app/config/env";
import type { CookieOptions, Request, Response } from "express";

export const COOKIE_NAMES = {
	accessToken: "accessToken",
	refreshToken: "refreshToken",
	session: "better-auth.session_token",
} as const;

const UNIT_MS = {
	ms: 1,
	s: 1000,
	m: 60_000,
	h: 3_600_000,
	d: 86_400_000,
	w: 604_800_000,
	y: 31_557_600_000,
} as const;

const durationToMs = (duration: string): number => {
	const match = /^(\d+(?:\.\d+)?)\s?(ms|s|m|h|d|w|y)$/i.exec(duration);
	const value = Number(match?.[1]);
	const unit = match?.[2]?.toLowerCase() as keyof typeof UNIT_MS | undefined;

	if (!unit || Number.isNaN(value)) {
		throw new Error(`Invalid duration: ${duration}`);
	}

	return Math.round(value * UNIT_MS[unit]);
};

const ACCESS_TOKEN_MAX_AGE = durationToMs(envVars.ACCESS_TOKEN_EXPIRES_IN);
const REFRESH_TOKEN_MAX_AGE = durationToMs(envVars.REFRESH_TOKEN_EXPIRES_IN);

const baseCookieOptions: CookieOptions = {
	httpOnly: true,
	secure: isProduction,
	sameSite: "lax",
	path: "/",
	...(envVars.COOKIE_DOMAIN && { domain: envVars.COOKIE_DOMAIN }),
};

const setAccessTokenCookie = (res: Response, token: string) => {
	res.cookie(COOKIE_NAMES.accessToken, token, { ...baseCookieOptions, maxAge: ACCESS_TOKEN_MAX_AGE });
};

const setRefreshTokenCookie = (res: Response, token: string) => {
	res.cookie(COOKIE_NAMES.refreshToken, token, { ...baseCookieOptions, maxAge: REFRESH_TOKEN_MAX_AGE });
};

const setSessionCookie = (res: Response, token: string) => {
	res.cookie(COOKIE_NAMES.session, token, { ...baseCookieOptions, maxAge: REFRESH_TOKEN_MAX_AGE });
};

const clearAuthCookies = (res: Response) => {
	res.clearCookie(COOKIE_NAMES.accessToken, baseCookieOptions);
	res.clearCookie(COOKIE_NAMES.refreshToken, baseCookieOptions);
	res.clearCookie(COOKIE_NAMES.session, baseCookieOptions);
};

const getCookie = (req: Request, name: string): string | undefined => {
	const value: unknown = req.cookies?.[name];
	return typeof value === "string" && value.length > 0 ? value : undefined;
};

export const cookieUtils = {
	setAccessTokenCookie,
	setRefreshTokenCookie,
	setSessionCookie,
	clearAuthCookies,
	getCookie,
};
