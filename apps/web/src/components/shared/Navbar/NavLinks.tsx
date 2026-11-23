"use client";

import type { NavItem } from "@/lib/publicNavItems";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

interface NavLinksProps {
	items: NavItem[];
	onNavigate?: () => void;
	className?: string;
	linkClassName?: string;
}

function isActive(href: string, pathname: string | null) {
	if (!pathname || href.includes("#")) return false;
	if (href === "/") return pathname === "/";
	return pathname === href || pathname.startsWith(`${href}/`);
}

// cacheComponents: dynamic route-এ (/doctors/[id]) pathname prerender-এর সময় জানা থাকে না,
// তাই usePathname()-কে Suspense-এর ভেতরে রাখতে হয়। fallback-এ একই link, শুধু active রং ছাড়া —
// prerender করা HTML-এ menu পুরোটা থাকে, pathname এলে active link রং পায়।
export function NavLinks(props: NavLinksProps) {
	return (
		<Suspense fallback={<NavLinkList {...props} pathname={null} />}>
			<ActiveNavLinks {...props} />
		</Suspense>
	);
}

function ActiveNavLinks(props: NavLinksProps) {
	const pathname = usePathname();
	return <NavLinkList {...props} pathname={pathname} />;
}

function NavLinkList({
	items,
	onNavigate,
	className,
	linkClassName,
	pathname,
}: NavLinksProps & { pathname: string | null }) {
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
								"rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
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
