"use client";

import type { NavItem } from "@/lib/publicNavItems";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinksProps {
	items: NavItem[];
	onNavigate?: () => void;
	className?: string;
	linkClassName?: string;
}

function isActive(href: string, pathname: string) {
	if (href.includes("#")) return false;
	if (href === "/") return pathname === "/";
	return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ items, onNavigate, className, linkClassName }: NavLinksProps) {
	const pathname = usePathname();

	return (
		<ul className={cn("flex items-center gap-8", className)}>
			{items.map((item) => {
				const active = isActive(item.href, pathname);
				return (
					<li key={item.href}>
						<Link
							href={item.href}
							onClick={onNavigate}
							aria-current={active ? "page" : undefined}
							className={cn(
								"rounded-md text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
								active ? "text-primary" : "text-body hover:text-foreground",
								linkClassName,
							)}
						>
							{item.title}
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
