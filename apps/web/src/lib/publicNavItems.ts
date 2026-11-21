export interface NavItem {
	title: string;
	href: string;
}

export interface NavGroup {
	title: string;
	items: NavItem[];
}

const homeSectionItems: NavItem[] = [
	{ title: "Services", href: "/#services" },
	{ title: "How it works", href: "/#how-it-works" },
	{ title: "For patients", href: "/#faq" },
];

export const publicNavItems: NavItem[] = [{ title: "Find a doctor", href: "/doctors" }, ...homeSectionItems];

export const footerNavGroups: NavGroup[] = [
	{
		title: "Patients",
		items: [
			{ title: "Find a doctor", href: "/doctors" },
			{ title: "Patient portal", href: "/portal" },
			{ title: "Log in", href: "/login" },
			{ title: "Create account", href: "/signup" },
		],
	},
	{
		title: "Hospital",
		items: homeSectionItems,
	},
	{
		title: "Legal",
		items: [
			{ title: "Privacy policy", href: "/privacy" },
			{ title: "Terms of use", href: "/terms" },
			{ title: "Accessibility", href: "/accessibility" },
		],
	},
];
