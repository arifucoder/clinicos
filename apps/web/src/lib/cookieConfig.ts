// api-র apps/api/src/app/utils/cookie.ts-এর COOKIE_NAMES-এর সাথে হুবহু মিলতে হবে।
// না মিললে checkAuth session খুঁজে পাবে না, আর সব request 401 দেবে।
export const AUTH_COOKIES = {
	accessToken: "accessToken",
	refreshToken: "refreshToken",
	sessionToken: "better-auth.session_token",
} as const;

// login (Server Action) আর proxy দুই জায়গাতেই একই attribute — এক জায়গায় রাখলে কখনো আলাদা হবে না
export const AUTH_COOKIE_OPTIONS = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax",
	path: "/",
} as const;
