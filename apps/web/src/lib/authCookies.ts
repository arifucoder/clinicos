import "server-only";

import { AUTH_COOKIE_OPTIONS, AUTH_COOKIES } from "@/lib/cookieConfig";
import { parseAuthSetCookies, toCookieLifetime } from "@/lib/setCookie";
import { cookies } from "next/headers";

// api-র cookie Next-এর নিজের domain-এ আবার বসানো (BFF)। কয়টা বসল সেটা ফেরত দেয়।
export const applyAuthCookies = async (setCookies: string[]): Promise<number> => {
	const cookieStore = await cookies();
	const authCookies = parseAuthSetCookies(setCookies);

	for (const cookie of authCookies) {
		cookieStore.set(cookie.name, cookie.value, { ...AUTH_COOKIE_OPTIONS, ...toCookieLifetime(cookie) });
	}

	return authCookies.length;
};

// password reset বা logout-এর পরে এই browser-এর তিনটা auth cookie মোছা
export const clearAuthCookies = async () => {
	const cookieStore = await cookies();
	for (const name of Object.values(AUTH_COOKIES)) cookieStore.delete(name);
};
