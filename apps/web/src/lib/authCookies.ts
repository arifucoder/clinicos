import "server-only";

import { AUTH_COOKIES } from "@/lib/cookieConfig";
import { cookies } from "next/headers";

const ALLOWED_COOKIES = new Set<string>(Object.values(AUTH_COOKIES));

interface ParsedCookie {
	name: string;
	value: string;
	maxAge?: number;
	expires?: Date;
}

// "accessToken=abc; Max-Age=900; Path=/; HttpOnly; SameSite=Lax" → { name, value, maxAge }
const parseSetCookie = (header: string): ParsedCookie | null => {
	const parts = header.split(";");
	const pair = parts[0] ?? "";
	const separator = pair.indexOf("=");
	if (separator <= 0) return null;

	let value: string;
	try {
		value = decodeURIComponent(pair.slice(separator + 1).trim());
	} catch {
		return null;
	}

	const cookie: ParsedCookie = { name: pair.slice(0, separator).trim(), value };

	for (const attribute of parts.slice(1)) {
		const [rawKey = "", ...rest] = attribute.split("=");
		const key = rawKey.trim().toLowerCase();
		const attributeValue = rest.join("=").trim();

		if (key === "max-age") {
			const seconds = Number(attributeValue);
			if (Number.isFinite(seconds)) cookie.maxAge = seconds;
		}
		if (key === "expires") {
			const date = new Date(attributeValue);
			if (!Number.isNaN(date.getTime())) cookie.expires = date;
		}
	}

	return cookie;
};

// api-র cookie Next-এর নিজের domain-এ আবার বসানো (BFF)। কয়টা বসল সেটা ফেরত দেয়।
export const applyAuthCookies = async (setCookies: string[]): Promise<number> => {
	const cookieStore = await cookies();
	let applied = 0;

	for (const header of setCookies) {
		const cookie = parseSetCookie(header);
		if (!cookie || !ALLOWED_COOKIES.has(cookie.name)) continue;

		// নাম, মান আর মেয়াদ api থেকে; বাকি নিরাপত্তার attribute Next নিজে ঠিক করে
		cookieStore.set(cookie.name, cookie.value, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: cookie.maxAge,
			expires: cookie.maxAge === undefined ? cookie.expires : undefined,
		});
		applied++;
	}

	return applied;
};
