import { Logo } from "@/components/shared/Logo";
import { getHomeForRole } from "@/lib/authRedirect";
import { ROLE_LABELS, type ShellUser } from "@/lib/userDisplay";
import { SidebarNav } from "./SidebarNav";
import { UserAvatar } from "./UserAvatar";

interface SidebarContentProps {
	user: ShellUser;
	onNavigate?: () => void; // mobile sheet বন্ধ করার জন্য
}

// desktop sidebar আর mobile sheet: দুই জায়গায় একই ভেতরের অংশ (DRY)
export function SidebarContent({ user, onNavigate }: SidebarContentProps) {
	return (
		<>
			<div className="flex h-16 shrink-0 items-center border-b border-canvas px-5">
				<Logo href={getHomeForRole(user.role)} />
			</div>

			<SidebarNav role={user.role} onNavigate={onNavigate} />

			<div className="m-3 flex items-center gap-2.5 rounded-xl border border-sidebar-border p-3">
				<UserAvatar user={user} className="size-9" />
				<div className="flex min-w-0 flex-col">
					<span className="truncate text-[13px] font-semibold text-foreground">{user.name}</span>
					<span className="truncate text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</span>
				</div>
			</div>
		</>
	);
}
