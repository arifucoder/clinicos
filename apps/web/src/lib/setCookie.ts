import { AUTH_COOKIES } from "@/lib/cookieConfig";

export interface ParsedCookie {
	name: string;
	value: string;
	maxAge?: number;
	expires?: Date;
}

const ALLOWED_COOKIES = new Set<string>(Object.values(AUTH_COOKIES));

export const parseSetCookie = (header: string): ParsedCookie | null => {
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

export const parseAuthSetCookies = (headers: string[]): ParsedCookie[] =>
	headers
		.map(parseSetCookie)
		.filter((cookie): cookie is ParsedCookie => cookie !== null && ALLOWED_COOKIES.has(cookie.name));

export const toCookieLifetime = (cookie: ParsedCookie) => ({
	maxAge: cookie.maxAge,
	expires: cookie.maxAge === undefined ? cookie.expires : undefined,
});
