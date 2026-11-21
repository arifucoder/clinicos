export type UserRole = "SUPER_ADMIN" | "ADMIN" | "DOCTOR" | "PATIENT";

const ROLE_HOME: Record<UserRole, string> = {
	SUPER_ADMIN: "/admin",
	ADMIN: "/admin",
	DOCTOR: "/doctor",
	PATIENT: "/portal",
};

export const getHomeForRole = (role: UserRole) => ROLE_HOME[role];

// ?next= শুধু নিজের site-এর path আর নিজের role-এর এলাকা হলে মানি (open redirect ঠেকাতে)
export const getPostLoginRedirect = (role: UserRole, next: unknown): string => {
	const home = getHomeForRole(role);

	if (typeof next !== "string") return home;
	const isRelative = next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\");
	const isOwnArea = next === home || next.startsWith(`${home}/`);

	return isRelative && isOwnArea ? next : home;
};
