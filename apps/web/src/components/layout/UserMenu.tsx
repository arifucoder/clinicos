"use client";

import { logoutAction } from "@/actions/auth.action";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CHANGE_PASSWORD_PATH, getHomeForRole } from "@/lib/authRedirect";
import type { ShellUser } from "@/lib/userDisplay";
import { ChevronDown, KeyRound, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { UserAvatar } from "./UserAvatar";

interface UserMenuProps {
	user: ShellUser;
	// public navbar-এ true; dashboard-এর ভেতরে sidebar থাকায় দরকার নেই
	showDashboardLink?: boolean;
}

export function UserMenu({ user, showDashboardLink = false }: UserMenuProps) {
	const [isPending, startTransition] = useTransition();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant="ghost"
						className="h-10 gap-1 rounded-full pr-1.5 pl-1"
						aria-label={`Account menu for ${user.name}`}
					/>
				}
			>
				<UserAvatar user={user} className="size-8" />
				<ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-60">
				{/* Base UI-তে GroupLabel-কে Group-এর ভেতরে রাখতেই হবে */}
				<DropdownMenuGroup>
					<DropdownMenuLabel className="flex flex-col">
						<span className="truncate text-sm font-semibold text-foreground">{user.name}</span>
						<span className="truncate font-normal">{user.email}</span>
					</DropdownMenuLabel>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />
				{showDashboardLink && (
					<DropdownMenuItem render={<Link href={getHomeForRole(user.role)} />}>
						<LayoutDashboard />
						Dashboard
					</DropdownMenuItem>
				)}
				<DropdownMenuItem render={<Link href={CHANGE_PASSWORD_PATH} />}>
					<KeyRound />
					Change password
				</DropdownMenuItem>

				<DropdownMenuSeparator />
				<DropdownMenuItem
					variant="destructive"
					disabled={isPending}
					onClick={() => startTransition(() => logoutAction())}
				>
					<LogOut />
					{isPending ? "Logging out…" : "Log out"}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
