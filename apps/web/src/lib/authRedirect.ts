export const USER_ROLES = ["SUPER_ADMIN", "ADMIN", "DOCTOR", "PATIENT"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const ROLE_HOME: Record<UserRole, string> = {
	SUPER_ADMIN: "/admin",
	ADMIN: "/admin",
	DOCTOR: "/doctor",
	PATIENT: "/portal",
};

const AUTH_ONLY_ROUTES = ["/login", "/signup", "/verify-email", "/forgot-password", "/reset-password"];

export const CHANGE_PASSWORD_PATH = "/dashboard/change-password";

const LOGGED_IN_ROUTES = ["/dashboard"];

const ROLE_AREAS: { prefix: string; roles: readonly UserRole[] }[] = [
	{ prefix: "/admin", roles: ["SUPER_ADMIN", "ADMIN"] },
	{ prefix: "/doctor", roles: ["DOCTOR"] },
	{ prefix: "/portal", roles: ["PATIENT"] },
];

export const getHomeForRole = (role: UserRole) => ROLE_HOME[role];

export const matchesPrefix = (pathname: string, prefix: string) =>
	pathname === prefix || pathname.startsWith(`${prefix}/`);

export const isAuthOnlyRoute = (pathname: string) => AUTH_ONLY_ROUTES.some((route) => matchesPrefix(pathname, route));

export const getRoleArea = (pathname: string) => ROLE_AREAS.find((area) => matchesPrefix(pathname, area.prefix));

export const isProtectedRoute = (pathname: string) =>
	getRoleArea(pathname) !== undefined || LOGGED_IN_ROUTES.some((route) => matchesPrefix(pathname, route));

export const isSafeRelativePath = (value: unknown): value is string =>
	typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\");

export const withNext = (href: string, next: unknown) =>
	isSafeRelativePath(next) ? `${href}${href.includes("?") ? "&" : "?"}next=${encodeURIComponent(next)}` : href;

export const getPostLoginRedirect = (role: UserRole, next: unknown): string => {
	const home = getHomeForRole(role);

	if (!isSafeRelativePath(next)) return home;
	const pathOnly = next.split("?")[0] ?? next;

	return matchesPrefix(pathOnly, home) ? next : home;
};
