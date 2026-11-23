import { DoctorHistoryTable } from "@/components/modules/doctor/DoctorHistoryTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTableSkeleton } from "@/components/shared/data-table/DataTableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { AppointmentService } from "@/services/appointment.service";
import { DOCTOR_HISTORY_STATUSES, doctorHistoryQuerySchema } from "@/zod/appointment.validation";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Appointment history" };

type SearchParams = PageProps<"/doctor/appointments">["searchParams"];

export default function DoctorHistoryPage({ searchParams }: PageProps<"/doctor/appointments">) {
	return (
		<Suspense fallback={<HistorySkeleton />}>
			<HistoryContent searchParams={searchParams} />
		</Suspense>
	);
}

async function HistoryContent({ searchParams }: { searchParams: SearchParams }) {
	// ভুল URL (?status=CONFIRMED&page=-3) → crash না করে default
	const query = doctorHistoryQuerySchema.parse(await searchParams);

	// date পাঠাই না → সব দিনের। doctorId পাঠাই না → api session থেকে নিজের doctor বসায় (IDOR-safe)
	const response = await AppointmentService.getAppointments({
		status: query.status ? [query.status] : [...DOCTOR_HISTORY_STATUSES],
		patientId: query.patientId,
		searchTerm: query.searchTerm,
		sortBy: query.sortBy,
		sortOrder: query.sortOrder,
		page: query.page,
		limit: query.limit,
	});

	const meta = response.meta ?? {
		page: query.page,
		limit: query.limit,
		total: response.data.length,
		totalPages: 1,
	};

	return (
		<div className="space-y-5">
			<div className="space-y-1">
				<PageHeader title="Appointment history" count={meta.total} />
				<p className="text-sm text-muted-foreground">Your completed, missed and cancelled appointments</p>
			</div>

			<DoctorHistoryTable data={response.data} meta={meta} query={query} />
		</div>
	);
}

function HistorySkeleton() {
	return (
		<div className="space-y-5">
			<Skeleton className="h-8 w-56" />
			<DataTableSkeleton rows={8} columns={5} />
		</div>
	);
}
