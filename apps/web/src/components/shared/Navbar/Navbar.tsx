import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { publicNavItems } from "@/lib/publicNavItems";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { MobileNav } from "./MobileNav";
import { MobileNavAuth, NavbarAuth, NavbarAuthSkeleton } from "./NavbarAuth";
import { NavLinks } from "./NavLinks";

export function Navbar() {
	return (
		<header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/75">
			<div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-5 md:h-18 md:gap-10 md:px-8">
				<Logo className="flex-1 lg:flex-none" />

				<nav aria-label="Main" className="hidden flex-1 lg:block">
					<NavLinks items={publicNavItems} />
				</nav>

				<div className="flex items-center gap-2">
					<Suspense fallback={<NavbarAuthSkeleton />}>
						<NavbarAuth />
					</Suspense>

					<Button
						render={<Link href="/doctors" />}
						nativeButton={false}
						size="lg"
						className="h-9 px-3 font-semibold md:h-10 md:px-4"
					>
						<span className="md:hidden">Book</span>
						<span className="hidden md:inline">Book a doctor</span>
						<ArrowRight className="hidden md:block" />
					</Button>

					<Suspense fallback={<MobileNav />}>
						<MobileNavAuth />
					</Suspense>
				</div>
			</div>
		</header>
	);
}
