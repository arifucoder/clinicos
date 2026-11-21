// api-র apps/api/src/app/utils/cookie.ts-এর COOKIE_NAMES-এর সাথে হুবহু মিলতে হবে।
// না মিললে checkAuth session খুঁজে পাবে না, আর সব request 401 দেবে।
export const AUTH_COOKIES = {
	accessToken: "accessToken",
	refreshToken: "refreshToken",
	sessionToken: "better-auth.session_token",
} as const;
