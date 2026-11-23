import { matchesPrefix, type UserRole } from "@/lib/authRedirect";
import {
	CalendarDays,
	CalendarPlus,
	ClipboardList,
	History,
	House,
	LayoutDashboard,
	type LucideIcon,
	Search,
	Stethoscope,
	Tags,
	UserCheck,
	UserCog,
	UserRound,
	Users,
} from "lucide-react";

export interface DashboardNavItem {
	title: string;
	href: string;
	icon: LucideIcon;
	/** true: শুধু হুবহু এই URL-এ active (যেমন "/admin" যেন "/admin/staff"-এ active না দেখায়) */
	exact?: boolean;
	/** বাড়তি যেসব path-এ এই item active দেখাবে (যেমন consultation page → "Today's patients") */
	alsoActiveOn?: string[];
}

export interface DashboardNavSection {
	title?: string;
	items: DashboardNavItem[];
}

// SUPER_ADMIN আর ADMIN একই menu (SDLC 7.2)। কে কোন কাজ পারবে তা api ঠিক করে, menu না।
const adminNav: DashboardNavSection[] = [
	{
		title: "Front desk",
		items: [
			{ title: "Appointments", href: "/admin/front-desk/appointments", icon: CalendarDays },
			{ title: "Book for patient", href: "/admin/front-desk/book", icon: CalendarPlus },
			{ title: "Check-in", href: "/admin/front-desk/check-in", icon: UserCheck },
		],
	},
	{
		title: "Clinical",
		items: [
			{ title: "Patients", href: "/admin/patients", icon: Users },
			{ title: "Doctors & slots", href: "/admin/slots", icon: Stethoscope },
		],
	},
	{
		title: "Admin",
		items: [
			{ title: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
			{ title: "Staff", href: "/admin/staff", icon: UserCog },
			{ title: "Specialties", href: "/admin/specialties", icon: Tags },
		],
	},
];

const doctorNav: DashboardNavSection[] = [
	{
		items: [
			{
				title: "Today's patients",
				href: "/doctor",
				icon: ClipboardList,
				exact: true,
			},
			// consultation page (/doctor/appointments/[id]) prefix মিলে এখানেই active দেখায়
			{ title: "History", href: "/doctor/appointments", icon: History },
			{ title: "My slots", href: "/doctor/slots", icon: CalendarDays },
			{ title: "Profile", href: "/doctor/profile", icon: UserRound },
		],
	},
];

const patientNav: DashboardNavSection[] = [
	{
		items: [
			{ title: "Home", href: "/portal", icon: House, exact: true },
			{ title: "Appointments", href: "/portal/appointments", icon: CalendarDays },
			{ title: "Profile", href: "/portal/profile", icon: UserRound },
			{ title: "Find a doctor", href: "/doctors", icon: Search },
		],
	},
];

// Record<UserRole, …>: নতুন role যোগ করলে এখানে menu না দেওয়া পর্যন্ত compile error
export const dashboardNavItems: Record<UserRole, DashboardNavSection[]> = {
	SUPER_ADMIN: adminNav,
	ADMIN: adminNav,
	DOCTOR: doctorNav,
	PATIENT: patientNav,
};

export const isNavItemActive = (pathname: string, item: DashboardNavItem): boolean => {
	const matchesSelf = item.exact ? pathname === item.href : matchesPrefix(pathname, item.href);
	return matchesSelf || (item.alsoActiveOn ?? []).some((path) => matchesPrefix(pathname, path));
};

export const findActiveNavItem = (pathname: string, role: UserRole) => {
	for (const section of dashboardNavItems[role]) {
		const item = section.items.find((navItem) => isNavItemActive(pathname, navItem));
		if (item) return { sectionTitle: section.title, item };
	}
	return null;
};
