import type { ShellUser } from "@/lib/userDisplay";
import { MobileSidebar } from "./MobileSidebar";
import { PageHeading } from "./PageHeading";
import { UserMenu } from "./UserMenu";

export function Topbar({ user }: { user: ShellUser }) {
	return (
		<header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-2 md:h-16 md:gap-5 md:px-6">
			<MobileSidebar user={user} />
			<PageHeading role={user.role} />
			{/* পরে এখানে: ⌘K search, today chip, doctors on duty, notifications */}
			<div className="ml-auto flex items-center gap-2">
				<UserMenu user={user} />
			</div>
		</header>
	);
}
