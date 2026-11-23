"use client";

import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { publicNavItems } from "@/lib/publicNavItems";
import { ArrowRight, LayoutDashboard, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { NavLinks } from "./NavLinks";

interface MobileNavProps {
	dashboardHref?: string;
}

export function MobileNav({ dashboardHref }: MobileNavProps) {
	const [open, setOpen] = useState(false);
	const close = () => setOpen(false);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				render={<Button variant="ghost" size="icon-lg" className="size-11 lg:hidden" aria-label="Open menu" />}
			>
				<Menu className="size-5" />
			</SheetTrigger>

			<SheetContent side="left" className="w-[85%] gap-0 p-0 sm:max-w-sm">
				<SheetHeader className="border-b border-border p-5">
					<Logo />
					<SheetTitle className="sr-only">Menu</SheetTitle>
					<SheetDescription className="sr-only">Site navigation and account links</SheetDescription>
				</SheetHeader>

				<nav aria-label="Mobile" className="p-3">
					<NavLinks
						items={publicNavItems}
						onNavigate={close}
						className="flex-col items-stretch gap-1"
						linkClassName="flex h-11 items-center px-3 text-base hover:bg-muted"
					/>
				</nav>

				<Separator />

				<div className="flex flex-col gap-2 p-5">
					<Button
						render={<Link href={dashboardHref ?? "/login"} />}
						nativeButton={false}
						variant="outline"
						size="lg"
						className="h-11 w-full"
						onClick={close}
					>
						{dashboardHref ? (
							<>
								<LayoutDashboard />
								Go to dashboard
							</>
						) : (
							"Log in"
						)}
					</Button>
					<Button
						render={<Link href="/doctors" />}
						nativeButton={false}
						size="lg"
						className="h-11 w-full"
						onClick={close}
					>
						Book a doctor
						<ArrowRight />
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
}
