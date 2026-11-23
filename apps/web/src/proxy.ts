import { getHomeForRole, getRoleArea, isAuthOnlyRoute, isProtectedRoute } from "@/lib/authRedirect";
import { AUTH_COOKIE_OPTIONS, AUTH_COOKIES } from "@/lib/cookieConfig";
import { type AccessTokenPayload, decodeAccessToken, isExpired, isExpiringSoon } from "@/lib/jwtUtils";
import { type ParsedCookie, parseAuthSetCookies, toCookieLifetime } from "@/lib/setCookie";
import { type NextRequest, NextResponse } from "next/server";

const REFRESH_TIMEOUT_MS = 10_000;

type RefreshOutcome = { ok: true; cookies: ParsedCookie[] } | { ok: false; clearSession: boolean }; // clearSession: session সত্যিই শেষ (401/403), নাকি শুধু api-তে পৌঁছানো যায়নি

const refreshSession = async (refreshToken: string, sessionToken: string): Promise<RefreshOutcome> => {
	const baseUrl = process.env.API_BASE_URL;
	if (!baseUrl) return { ok: false, clearSession: false };

	try {
		const response = await fetch(`${baseUrl}/auth/refresh-token`, {
			method: "POST",
			headers: {
				Cookie: [
					`${AUTH_COOKIES.refreshToken}=${encodeURIComponent(refreshToken)}`,
					`${AUTH_COOKIES.sessionToken}=${encodeURIComponent(sessionToken)}`,
				].join("; "),
			},
			cache: "no-store",
			signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS),
		});

		if (response.status === 401 || response.status === 403) return { ok: false, clearSession: true };
		if (!response.ok) return { ok: false, clearSession: false };

		const cookies = parseAuthSetCookies(response.headers.getSetCookie());
		return cookies.length > 0 ? { ok: true, cookies } : { ok: false, clearSession: false };
	} catch {
		return { ok: false, clearSession: false };
	}
};

const getRedirectPath = (pathname: string, search: string, payload: AccessTokenPayload | null): string | null => {
	if (payload) {
		const home = getHomeForRole(payload.role);
		if (isAuthOnlyRoute(pathname) || pathname === "/dashboard") return home;

		const area = getRoleArea(pathname);
		if (area && !area.roles.includes(payload.role)) return home;

		return null;
	}

	if (isProtectedRoute(pathname)) {
		return `/login?next=${encodeURIComponent(pathname + search)}`;
	}

	return null;
};

const writeResponseCookies = (response: NextResponse, newCookies: ParsedCookie[], clearSession: boolean) => {
	for (const cookie of newCookies) {
		response.cookies.set(cookie.name, cookie.value, { ...AUTH_COOKIE_OPTIONS, ...toCookieLifetime(cookie) });
	}
	if (clearSession) {
		for (const name of Object.values(AUTH_COOKIES)) response.cookies.delete(name);
	}
};

export async function proxy(request: NextRequest) {
	const { pathname, search } = request.nextUrl;

	const accessToken = request.cookies.get(AUTH_COOKIES.accessToken)?.value;
	const refreshToken = request.cookies.get(AUTH_COOKIES.refreshToken)?.value;
	const sessionToken = request.cookies.get(AUTH_COOKIES.sessionToken)?.value;

	let payload = decodeAccessToken(accessToken);
	let newCookies: ParsedCookie[] = [];
	let clearSession = false;

	if ((!payload || isExpiringSoon(payload.exp)) && refreshToken && sessionToken) {
		const outcome = await refreshSession(refreshToken, sessionToken);

		if (outcome.ok) {
			newCookies = outcome.cookies;
			const newAccessToken = newCookies.find((cookie) => cookie.name === AUTH_COOKIES.accessToken)?.value;
			payload = decodeAccessToken(newAccessToken) ?? payload;
		} else if (outcome.clearSession) {
			clearSession = true;
			payload = null;
		}
	}

	if (payload && isExpired(payload.exp)) payload = null;

	const redirectPath = getRedirectPath(pathname, search, payload);
	if (redirectPath) {
		const response = NextResponse.redirect(new URL(redirectPath, request.url));
		writeResponseCookies(response, newCookies, clearSession); // redirect-এও নতুন cookie হারাবে না
		return response;
	}

	for (const cookie of newCookies) request.cookies.set(cookie.name, cookie.value);
	if (clearSession) {
		for (const name of Object.values(AUTH_COOKIES)) request.cookies.delete(name);
	}

	const response = NextResponse.next({ request: { headers: new Headers(request.headers) } });
	writeResponseCookies(response, newCookies, clearSession);
	return response;
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
