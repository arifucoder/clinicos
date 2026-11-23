import { PORTAL_TAB_CONFIG } from "@/lib/portalAppointments";
import {
	PORTAL_APPOINTMENT_TABS,
	type PortalAppointmentTab,
	type PortalAppointmentsQuery,
} from "@/zod/appointment.validation";
import { cn } from "cn";
import Link from "next/link";

interface PortalAppointmentTabsProps {
	active: PortalAppointmentTab;
	counts: Record<PortalAppointmentTab, number>;
	query: Pick<PortalAppointmentsQuery, "searchTerm" | "year" | "month">;
}

export function PortalAppointmentTabs({ active, counts, query }: PortalAppointmentTabsProps) {
	const keep = Object.fromEntries(
		Object.entries({ searchTerm: query.searchTerm, year: query.year, month: query.month }).filter(
			([, value]) => value !== undefined,
		),
	);

	return (
		<nav aria-label="Appointment list" className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-border">
			{PORTAL_APPOINTMENT_TABS.map((tab) => {
				const isActive = tab === active;
				return (
					<Link
						key={tab}
						href={{ pathname: "/portal/appointments", query: { tab, ...keep } }}
						scroll={false}
						aria-current={isActive ? "page" : undefined}
						className={cn(
							"-mb-px flex shrink-0 items-center gap-2 rounded-t-md border-b-2 px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset",
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
