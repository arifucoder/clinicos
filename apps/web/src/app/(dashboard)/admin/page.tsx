import { AdminTodayStats } from "@/components/modules/dashboard/AdminTodayStats";
import { DailyActivityCard } from "@/components/modules/dashboard/DailyActivityCard";
import { DoctorStatsTable } from "@/components/modules/dashboard/DoctorStatsTable";
import { PeriodSummary } from "@/components/modules/dashboard/PeriodSummary";
import { RangeTabs } from "@/components/modules/dashboard/RangeTabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDayLabel } from "@/lib/clinicDate";
import { StatsService } from "@/services/stats.service";
import { adminStatsQuerySchema } from "@/zod/stats.validation";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Dashboard" };

type SearchParams = PageProps<"/admin">["searchParams"];

export default function AdminDashboardPage({ searchParams }: PageProps<"/admin">) {
	return (
		<Suspense fallback={<DashboardSkeleton />}>
			<DashboardContent searchParams={searchParams} />
		</Suspense>
	);
}

async function DashboardContent({ searchParams }: { searchParams: SearchParams }) {
	const { days } = adminStatsQuerySchema.parse(await searchParams);

	const { data: stats } = await StatsService.getAdminStats(days);

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<PageHeader title="Dashboard" actions={<RangeTabs days={stats.range.days} />} />
				<p className="text-sm text-muted-foreground">
					Today is {formatDayLabel(stats.today.date)} · {formatDayLabel(stats.range.from)} –{" "}
					{formatDayLabel(stats.range.to)}
				</p>
			</div>

			<section aria-labelledby="today-heading" className="space-y-3">
				<h2 id="today-heading" className="font-heading text-base font-semibold text-foreground">
					Today
				</h2>
				<AdminTodayStats today={stats.today} />
			</section>

			<div className="grid items-start gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<DailyActivityCard daily={stats.daily} days={stats.range.days} />
				</div>
				<PeriodSummary totals={stats.totals} days={stats.range.days} />
			</div>

			<DoctorStatsTable doctors={stats.byDoctor} days={stats.range.days} />
		</div>
	);
}

function DashboardSkeleton() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-40" />
				<Skeleton className="h-10 w-56" />
			</div>
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
				{Array.from({ length: 6 }, (_, index) => (
					<Skeleton key={index} className="h-24 rounded-xl" />
				))}
			</div>
			<div className="grid gap-6 lg:grid-cols-3">
				<Skeleton className="h-96 rounded-xl lg:col-span-2" />
				<Skeleton className="h-96 rounded-xl" />
			</div>
			<Skeleton className="h-64 rounded-xl" />
		</div>
	);
}
