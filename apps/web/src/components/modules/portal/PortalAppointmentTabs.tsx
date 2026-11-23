import { PORTAL_TAB_CONFIG } from "@/lib/portalAppointments";
import { PORTAL_APPOINTMENT_TABS, type PortalAppointmentTab } from "@/zod/appointment.validation";
import { cn } from "cn";
import Link from "next/link";

interface PortalAppointmentTabsProps {
	active: PortalAppointmentTab;
	counts: Record<PortalAppointmentTab, number>;
}

// Link-ভিত্তিক tab (DoctorTodayTabs-এর মতো): URL-এ থাকে, back বাটনে ফেরা যায়
export function PortalAppointmentTabs({ active, counts }: PortalAppointmentTabsProps) {
	return (
		<nav aria-label="Appointment list" className="flex gap-1 overflow-x-auto border-b border-border">
			{PORTAL_APPOINTMENT_TABS.map((tab) => {
				const isActive = tab === active;
				return (
					<Link
						key={tab}
						// শুধু tab: page আর payment banner নতুন tab-এ আসবে না
						href={{ pathname: "/portal/appointments", query: { tab } }}
						scroll={false}
						aria-current={isActive ? "page" : undefined}
						className={cn(
							"-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
							isActive
								? "border-primary text-primary"
								: "border-transparent text-muted-foreground hover:text-foreground",
						)}
					>
						{PORTAL_TAB_CONFIG[tab].label}
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
