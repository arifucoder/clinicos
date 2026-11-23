"use client";

import { CHANGE_PASSWORD_PATH, type UserRole } from "@/lib/authRedirect";
import { findActiveNavItem } from "@/lib/dashboardNavItems";
import { usePathname } from "next/navigation";

const SHARED_PAGE_TITLES: Record<string, string> = {
	[CHANGE_PASSWORD_PATH]: "Change password",
};

export function PageHeading({ role }: { role: UserRole }) {
	const pathname = usePathname();
	const current = findActiveNavItem(pathname, role);
	if (!current) {
		// menu-তে নেই কিন্তু সব role-এর page (user menu থেকে খোলে)
		const title = SHARED_PAGE_TITLES[pathname];
		return title ? <span className="truncate font-heading text-[17px] font-bold text-foreground">{title}</span> : null;
	}

	return (
		<div className="flex min-w-0 flex-col leading-tight">
			{current.sectionTitle && (
				<nav aria-label="Breadcrumb" className="hidden text-xs text-muted-foreground md:block">
					{current.sectionTitle} <span aria-hidden="true">/</span>{" "}
					<span aria-current="page" className="text-body">
						{current.item.title}
					</span>
				</nav>
			)}
			{/* h1 না, span: আসল h1 প্রতিটা page নিজে দেবে (design-এ 28px "Patients") */}
			<span className="truncate font-heading text-[17px] font-bold text-foreground">{current.item.title}</span>
		</div>
	);
}
