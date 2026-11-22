import { StatGrid, type StatItem } from "@/components/shared/StatGrid";
import type { DoctorStats } from "@/types/stats.types";
import { CalendarCheck, CalendarRange, CheckCircle2, Clock, UserCheck, Users } from "lucide-react";

export function DoctorTodayStats({ stats }: { stats: DoctorStats }) {
	// api ৭ দিনের প্রতিদিনের হিসাব দেয় → card-এ মোট
	const weekCompleted = stats.last7Days.reduce((sum, day) => sum + day.completed, 0);

	const items: StatItem[] = [
		{ label: "Waiting now", value: String(stats.today.waiting), icon: UserCheck, tone: "success" },
		{ label: "Not arrived", value: String(stats.today.notArrived), icon: Clock, tone: "warning" },
		{ label: "Completed today", value: String(stats.today.completed), icon: CheckCircle2, tone: "primary" },
		{ label: "Last 7 days", value: String(weekCompleted), icon: CalendarRange, tone: "primary" },
		{ label: "This month", value: String(stats.thisMonth.completed), icon: CalendarCheck, tone: "primary" },
		{ label: "Patients this month", value: String(stats.thisMonth.patientsSeen), icon: Users, tone: "primary" },
	];

	return <StatGrid items={items} />;
}
