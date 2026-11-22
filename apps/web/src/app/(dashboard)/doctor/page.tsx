import { DoctorTodayStats } from "@/components/modules/doctor/DoctorTodayStats";
import {
	CheckedInSection,
	CompletedSection,
	NotArrivedSection,
} from "@/components/modules/doctor/TodayPatientSections";
import { AutoRefresh } from "@/components/shared/AutoRefresh";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { clinicToday, formatDayLabel } from "@/lib/clinicDate";
import { AppointmentService } from "@/services/appointment.service";
import { StatsService } from "@/services/stats.service";
import type { AppointmentStatus } from "@/types/appointment.types";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Today's patients" };

// এই তিন অবস্থার রোগীই page-এ দেখাই (cancelled / no-show / hold বাদ)
const TODAY_STATUSES: AppointmentStatus[] = ["CHECKED_IN", "CONFIRMED", "COMPLETED"];

export default function DoctorDashboardPage() {
	return (
		<Suspense fallback={<TodaySkeleton />}>
			<TodayContent />
		</Suspense>
	);
}

async function TodayContent() {
	// request-time-এ চালাও → এর পরে new Date() নিরাপদ
	await connection();
	const today = clinicToday(new Date());

	// api doctor-এর জন্য নিজে থেকেই শুধু নিজের appointment দেয় (doctorId পাঠাই না)
	const [statsResponse, appointmentsResponse] = await Promise.all([
		StatsService.getDoctorStats(),
		AppointmentService.getAppointments({
			date: today,
			status: TODAY_STATUSES,
			sortBy: "startAt",
			sortOrder: "asc",
			limit: 100, // api-র সর্বোচ্চ; এক দিনে একজন doctor-এর জন্য যথেষ্ট
		}),
	]);

	// একটা request, তিন ভাগ — startAt অনুযায়ী আগেই সাজানো
	const appointments = appointmentsResponse.data;
	const checkedIn = appointments.filter((appointment) => appointment.status === "CHECKED_IN");
	const notArrived = appointments.filter((appointment) => appointment.status === "CONFIRMED");
	const completed = appointments.filter((appointment) => appointment.status === "COMPLETED");

	return (
		<div className="space-y-6">
			{/* ৫ সেকেন্ড পরপর নতুন data; tab লুকানো থাকলে থামে */}
			<AutoRefresh />

			<div className="space-y-1">
				<PageHeader title="Today's patients" />
				<p className="text-sm text-muted-foreground">{formatDayLabel(today)}</p>
			</div>

			<DoctorTodayStats stats={statsResponse.data} />

			<CheckedInSection appointments={checkedIn} />
			<NotArrivedSection appointments={notArrived} />
			<CompletedSection appointments={completed} />
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
			<Skeleton className="h-56 rounded-xl" />
			<Skeleton className="h-40 rounded-xl" />
			<Skeleton className="h-14 rounded-xl" />
		</div>
	);
}
