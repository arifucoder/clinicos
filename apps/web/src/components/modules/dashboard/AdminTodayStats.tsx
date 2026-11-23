import { StatGrid, type StatItem } from "@/components/shared/StatGrid";
import { formatCents } from "@/lib/format";
import type { AdminStats } from "@/types/stats.types";
import { Banknote, CalendarDays, CheckCircle2, Clock, UserCheck, UserX } from "lucide-react";

export function AdminTodayStats({ today }: { today: AdminStats["today"] }) {
	const counts = today.byStatus;
	const booked = counts.CONFIRMED + counts.CHECKED_IN + counts.COMPLETED + counts.NO_SHOW;

	const items: StatItem[] = [
		{ label: "Booked", value: String(booked), icon: CalendarDays, tone: "primary" },
		{ label: "Checked in", value: String(counts.CHECKED_IN), icon: UserCheck, tone: "success" },
		{ label: "Completed", value: String(counts.COMPLETED), icon: CheckCircle2, tone: "primary" },
		{ label: "Not arrived", value: String(counts.CONFIRMED), icon: Clock, tone: "warning" },
		{ label: "No-show", value: String(counts.NO_SHOW), icon: UserX, tone: "danger" },
		{ label: "Collected today", value: formatCents(today.collectedCents), icon: Banknote, tone: "success" },
	];

	return <StatGrid items={items} />;
}
