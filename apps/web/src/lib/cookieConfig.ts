export const AUTH_COOKIES = {
	accessToken: "accessToken",
	refreshToken: "refreshToken",
	sessionToken: "better-auth.session_token",
} as const;

export const AUTH_COOKIE_OPTIONS = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax",
	path: "/",
} as const;
