import type { ShellUser } from "@/lib/userDisplay";
import { SidebarContent } from "./SidebarContent";

// desktop (lg+) এ স্থির sidebar; ছোট screen-এ MobileSidebar
export function AppSidebar({ user }: { user: ShellUser }) {
	return (
		<aside
			aria-label="Sidebar"
			className="sticky top-0 hidden h-svh w-62 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex"
		>
			<SidebarContent user={user} />
		</aside>
	);
}
