"use client";

import type { UserRole } from "@/lib/authRedirect";
import { dashboardNavItems, isNavItemActive } from "@/lib/dashboardNavItems";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarNavProps {
	role: UserRole; // nav array না, role পাঠাই (নিচে কারণ দেখো)
	onNavigate?: () => void;
}

export function SidebarNav({ role, onNavigate }: SidebarNavProps) {
	const pathname = usePathname();
	const sections = dashboardNavItems[role];

	return (
		<nav aria-label="Main" className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
			{sections.map((section, index) => (
				<div key={section.title ?? index} role="group" aria-label={section.title} className="flex flex-col gap-0.5">
					{section.title && (
						<span className="px-3 pb-1.5 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
							{section.title}
						</span>
					)}

					{section.items.map((item) => {
						const isActive = isNavItemActive(pathname, item);
						const Icon = item.icon;

						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={onNavigate}
								aria-current={isActive ? "page" : undefined}
								className={cn(
									"relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring",
									isActive && "bg-sidebar-accent font-semibold text-sidebar-accent-foreground hover:bg-sidebar-accent",
								)}
							>
								{isActive && (
									<span
										aria-hidden="true"
										className="absolute inset-y-2 left-0 w-[3px] rounded-r-[3px] bg-sidebar-primary"
									/>
								)}
								<Icon className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
								{item.title}
							</Link>
						);
					})}
				</div>
			))}

			<div role="group" aria-label="Site" className="flex flex-col gap-0.5">
				<span className="px-3 pb-1.5 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
					Site
				</span>
				<Link
					href="/"
					onClick={onNavigate}
					className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
				>
					<ExternalLink className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
					View public site
				</Link>
			</div>
		</nav>
	);
}
