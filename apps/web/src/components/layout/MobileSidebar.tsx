"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { ShellUser } from "@/lib/userDisplay";
import { Menu } from "lucide-react";
import { useState } from "react";
import { SidebarContent } from "./SidebarContent";

export function MobileSidebar({ user }: { user: ShellUser }) {
	const [open, setOpen] = useState(false);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				render={<Button variant="ghost" size="icon-lg" className="size-11 lg:hidden" aria-label="Open menu" />}
			>
				<Menu className="size-5" />
			</SheetTrigger>

			<SheetContent side="left" className="w-[85%] gap-0 bg-sidebar p-0 sm:max-w-xs">
				<SheetTitle className="sr-only">Menu</SheetTitle>
				<SheetDescription className="sr-only">Dashboard navigation</SheetDescription>
				<SidebarContent user={user} onNavigate={() => setOpen(false)} />
			</SheetContent>
		</Sheet>
	);
}
