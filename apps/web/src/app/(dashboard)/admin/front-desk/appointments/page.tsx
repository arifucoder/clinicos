import { AppointmentTable } from "@/components/modules/appointment/AppointmentTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTableSkeleton } from "@/components/shared/data-table/DataTableSkeleton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { clinicToday, formatDayLabel } from "@/lib/clinicDate";
import { AppointmentService } from "@/services/appointment.service";
import { DoctorService } from "@/services/doctor.service";
import type { SlotDoctorOption } from "@/types/slot.types";
import { appointmentListQuerySchema } from "@/zod/appointment.validation";
import { doctorListQuerySchema } from "@/zod/doctor.validation";
import { CalendarPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Appointments" };

type SearchParams = PageProps<"/admin/front-desk/appointments">["searchParams"];

const ACTIVE_DOCTORS_QUERY = doctorListQuerySchema.parse({
	isActive: "true",
	limit: 100,
	sortBy: "user.name",
	sortOrder: "asc",
});

export default function AppointmentsPage({ searchParams }: PageProps<"/admin/front-desk/appointments">) {
	return (
		<Suspense fallback={<AppointmentsSkeleton />}>
			<AppointmentsContent searchParams={searchParams} />
		</Suspense>
	);
}

async function AppointmentsContent({ searchParams }: { searchParams: SearchParams }) {
	const query = appointmentListQuerySchema.parse(await searchParams);

	// request-time-এ চালাও → এর পরে new Date() নিরাপদ
	await connection();
	const now = new Date();
	const today = clinicToday(now);
	const date = query.date ?? today;

	const [appointmentsResponse, doctorsResponse] = await Promise.all([
		AppointmentService.getAppointments({
			date,
			status: query.status ? [query.status] : undefined,
			source: query.source,
			doctorId: query.doctorId,
			searchTerm: query.searchTerm,
			sortBy: query.sortBy,
			sortOrder: query.sortOrder,
			page: query.page,
			limit: query.limit,
		}),
		DoctorService.getDoctors(ACTIVE_DOCTORS_QUERY),
	]);

	const meta = appointmentsResponse.meta ?? {
		page: query.page,
		limit: query.limit,
		total: appointmentsResponse.data.length,
		totalPages: 1,
	};

	const doctors: SlotDoctorOption[] = doctorsResponse.data.map((doctor) => ({
		id: doctor.id,
		name: doctor.user.name,
		specialties: doctor.specialties.map((specialty) => specialty.name).join(", "),
	}));
	const selectedDoctor = doctors.find((doctor) => doctor.id === query.doctorId);

	const subtitle = [`${formatDayLabel(date)}${date === today ? " (today)" : ""}`, selectedDoctor?.name]
		.filter(Boolean)
		.join(" · ");

	return (
		<div className="space-y-5">
			<div className="space-y-1">
				<PageHeader
					title="Appointments"
					count={meta.total}
					actions={
						<Button render={<Link href="/admin/front-desk/book" />} nativeButton={false}>
							<CalendarPlus aria-hidden="true" />
							Book for patient
						</Button>
					}
				/>
				<p className="text-sm text-muted-foreground">{subtitle}</p>
			</div>

			<AppointmentTable
				data={appointmentsResponse.data}
				meta={meta}
				query={query}
				date={date}
				today={today}
				nowMs={now.getTime()}
				doctors={doctors}
			/>
		</div>
	);
}

function AppointmentsSkeleton() {
	return (
		<div className="space-y-5">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-10 w-40" />
			</div>
			<DataTableSkeleton rows={8} columns={6} />
		</div>
	);
}
