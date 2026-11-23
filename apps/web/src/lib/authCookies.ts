import "server-only";

import { AUTH_COOKIE_OPTIONS, AUTH_COOKIES } from "@/lib/cookieConfig";
import { parseAuthSetCookies, toCookieLifetime } from "@/lib/setCookie";
import { cookies } from "next/headers";

export const applyAuthCookies = async (setCookies: string[]): Promise<number> => {
	const cookieStore = await cookies();
	const authCookies = parseAuthSetCookies(setCookies);

	for (const cookie of authCookies) {
		cookieStore.set(cookie.name, cookie.value, { ...AUTH_COOKIE_OPTIONS, ...toCookieLifetime(cookie) });
	}

	return authCookies.length;
};

export const clearAuthCookies = async () => {
	const cookieStore = await cookies();
	for (const name of Object.values(AUTH_COOKIES)) cookieStore.delete(name);
};
