import type { StaffTab } from "@/zod/admin.validation";
import { cn } from "cn";
import Link from "next/link";

const TABS: { value: StaffTab; label: string }[] = [
	{ value: "doctors", label: "Doctors" },
	{ value: "admins", label: "Admins" },
];

export function StaffTabs({ active, showAdmins }: { active: StaffTab; showAdmins: boolean }) {
	const tabs = TABS.filter((tab) => tab.value !== "admins" || showAdmins);
	if (tabs.length < 2) return null; // ADMIN শুধু doctors দেখে → tab-এর দরকার নেই

	return (
		<nav aria-label="Staff type" className="flex gap-1 border-b border-border">
			{tabs.map((tab) => {
				const isActive = tab.value === active;
				return (
					<Link
						key={tab.value}
						href={{ pathname: "/admin/staff", query: { tab: tab.value } }}
						aria-current={isActive ? "page" : undefined}
						className={cn(
							"-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
							isActive
								? "border-primary text-primary"
								: "border-transparent text-muted-foreground hover:text-foreground",
						)}
					>
						{tab.label}
					</Link>
				);
			})}
		</nav>
	);
}
