import { DoctorTodayStats } from "@/components/modules/doctor/DoctorTodayStats";
import { DoctorTodayTable } from "@/components/modules/doctor/DoctorTodayTable";
import { DoctorTodayTabs } from "@/components/modules/doctor/DoctorTodayTabs";
import { AutoRefresh } from "@/components/shared/AutoRefresh";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTableSkeleton } from "@/components/shared/data-table/DataTableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { clinicToday, formatDayLabel } from "@/lib/clinicDate";
import { DOCTOR_TAB_CONFIG, doctorTabCounts } from "@/lib/doctorToday";
import { AppointmentService } from "@/services/appointment.service";
import { StatsService } from "@/services/stats.service";
import { doctorTodayQuerySchema } from "@/zod/appointment.validation";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Today's patients" };

type SearchParams = PageProps<"/doctor">["searchParams"];

export default function DoctorDashboardPage({ searchParams }: PageProps<"/doctor">) {
	return (
		<Suspense fallback={<TodaySkeleton />}>
			<TodayContent searchParams={searchParams} />
		</Suspense>
	);
}

async function TodayContent({ searchParams }: { searchParams: SearchParams }) {
	// ভুল URL (?tab=xyz&page=-3) → crash না করে default
	const query = doctorTodayQuerySchema.parse(await searchParams);

	// request-time-এ চালাও → এর পরে new Date() নিরাপদ
	await connection();
	const today = clinicToday(new Date());
	const config = DOCTOR_TAB_CONFIG[query.tab];

	// api doctor-এর জন্য নিজে থেকেই শুধু নিজের appointment দেয় (doctorId পাঠাই না)
	const [statsResponse, appointmentsResponse] = await Promise.all([
		StatsService.getDoctorStats(),
		AppointmentService.getAppointments({
			date: today,
			status: config.statuses,
			sortBy: "startAt",
			sortOrder: config.sortOrder,
			searchTerm: query.searchTerm,
			page: query.page,
			limit: query.limit,
		}),
	]);

	const meta = appointmentsResponse.meta ?? {
		page: query.page,
		limit: query.limit,
		total: appointmentsResponse.data.length,
		totalPages: 1,
	};

	return (
		<div className="space-y-6">
			{/* ৫ সেকেন্ড পরপর নতুন data; URL-এ state থাকায় page/search হারায় না */}
			<AutoRefresh />

			<div className="space-y-1">
				<PageHeader title="Today's patients" />
				<p className="text-sm text-muted-foreground">{formatDayLabel(today)}</p>
			</div>

			<DoctorTodayStats stats={statsResponse.data} />

			<div className="space-y-3">
				<DoctorTodayTabs active={query.tab} counts={doctorTabCounts(statsResponse.data.today)} />
				<DoctorTodayTable data={appointmentsResponse.data} meta={meta} query={query} />
			</div>
		</div>
	);
}

function TodaySkeleton() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Skeleton className="h-8 w-56" />
				<Skeleton className="h-4 w-28" />
			</div>
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
				{Array.from({ length: 6 }, (_, index) => (
					<Skeleton key={index} className="h-24 rounded-xl" />
				))}
			</div>
			<div className="space-y-3">
				<Skeleton className="h-10 w-80" />
				<DataTableSkeleton rows={8} columns={4} />
			</div>
		</div>
	);
}
