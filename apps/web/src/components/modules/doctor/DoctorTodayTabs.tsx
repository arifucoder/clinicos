import { DOCTOR_TAB_CONFIG } from "@/lib/doctorToday";
import { DOCTOR_TODAY_TABS, type DoctorTodayTab } from "@/zod/appointment.validation";
import { cn } from "cn";
import Link from "next/link";

interface DoctorTodayTabsProps {
	active: DoctorTodayTab;
	counts: Record<DoctorTodayTab, number>;
}

// Link-ভিত্তিক tab (StaffTabs-এর মতো): JS ছাড়াও কাজ করে, URL-এ থাকে, back বাটনে ফেরা যায়
export function DoctorTodayTabs({ active, counts }: DoctorTodayTabsProps) {
	return (
		<nav aria-label="Patient list" className="flex gap-1 overflow-x-auto border-b border-border">
			{DOCTOR_TODAY_TABS.map((tab) => {
				const isActive = tab === active;
				return (
					<Link
						key={tab}
						// শুধু tab: আগের tab-এর page/search এখানে আসবে না
						href={{ pathname: "/doctor", query: { tab } }}
						scroll={false}
						aria-current={isActive ? "page" : undefined}
						className={cn(
							"-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
							isActive
								? "border-primary text-primary"
								: "border-transparent text-muted-foreground hover:text-foreground",
						)}
					>
						{DOCTOR_TAB_CONFIG[tab].label}
						<span
							className={cn(
								"rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
								isActive ? "bg-primary-soft text-primary" : "bg-muted text-body",
							)}
						>
							{counts[tab]}
						</span>
					</Link>
				);
			})}
		</nav>
	);
}
