export const USER_ROLES = ["SUPER_ADMIN", "ADMIN", "DOCTOR", "PATIENT"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const ROLE_HOME: Record<UserRole, string> = {
	SUPER_ADMIN: "/admin",
	ADMIN: "/admin",
	DOCTOR: "/doctor",
	PATIENT: "/portal",
};

// login করা থাকলে এগুলোতে ঢোকা যাবে না
const AUTH_ONLY_ROUTES = ["/login", "/signup", "/verify-email"];

// যেকোনো role, শুধু login লাগবে
const LOGGED_IN_ROUTES = ["/change-password", "/dashboard"];

// এলাকা অনুযায়ী কোন role ঢুকতে পারবে
const ROLE_AREAS: { prefix: string; roles: readonly UserRole[] }[] = [
	{ prefix: "/admin", roles: ["SUPER_ADMIN", "ADMIN"] },
	{ prefix: "/doctor", roles: ["DOCTOR"] },
	{ prefix: "/portal", roles: ["PATIENT"] },
];

export const getHomeForRole = (role: UserRole) => ROLE_HOME[role];

// "/admin" আর "/admin/staff" মেলে, কিন্তু "/administrator" না
export const matchesPrefix = (pathname: string, prefix: string) =>
	pathname === prefix || pathname.startsWith(`${prefix}/`);

export const isAuthOnlyRoute = (pathname: string) => AUTH_ONLY_ROUTES.some((route) => matchesPrefix(pathname, route));

export const getRoleArea = (pathname: string) => ROLE_AREAS.find((area) => matchesPrefix(pathname, area.prefix));

export const isProtectedRoute = (pathname: string) =>
	getRoleArea(pathname) !== undefined || LOGGED_IN_ROUTES.some((route) => matchesPrefix(pathname, route));

// ?next= শুধু নিজের site-এর path আর নিজের role-এর এলাকা হলে মানি (open redirect ঠেকাতে)
export const getPostLoginRedirect = (role: UserRole, next: unknown): string => {
	const home = getHomeForRole(role);

	if (typeof next !== "string") return home;
	const isRelative = next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\");
	const pathOnly = next.split("?")[0] ?? next;

	return isRelative && matchesPrefix(pathOnly, home) ? next : home;
};
