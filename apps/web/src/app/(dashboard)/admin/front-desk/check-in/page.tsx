import { CheckInList } from "@/components/modules/front-desk/CheckInList";
import { CheckInPagination } from "@/components/modules/front-desk/CheckInPagination";
import { CheckInToolbar } from "@/components/modules/front-desk/CheckInToolbar";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { clinicToday, formatDayLabel } from "@/lib/clinicDate";
import { AppointmentService } from "@/services/appointment.service";
import { DoctorService } from "@/services/doctor.service";
import type { AppointmentStatus } from "@/types/appointment.types";
import type { SlotDoctorOption } from "@/types/slot.types";
import { checkInQuerySchema } from "@/zod/appointment.validation";
import { doctorListQuerySchema } from "@/zod/doctor.validation";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Check-in" };

type SearchParams = PageProps<"/admin/front-desk/check-in">["searchParams"];

const ACTIVE_DOCTORS_QUERY = doctorListQuerySchema.parse({
	isActive: "true",
	limit: 100,
	sortBy: "user.name",
	sortOrder: "asc",
});

export default function CheckInPage({ searchParams }: PageProps<"/admin/front-desk/check-in">) {
	return (
		<Suspense fallback={<CheckInSkeleton />}>
			<CheckInContent searchParams={searchParams} />
		</Suspense>
	);
}

async function CheckInContent({ searchParams }: { searchParams: SearchParams }) {
	const query = checkInQuerySchema.parse(await searchParams);

	await connection();
	const today = clinicToday(new Date());

	const includeArrived = query.show === "all" || !!query.searchTerm;
	const status: AppointmentStatus[] = includeArrived ? ["CONFIRMED", "CHECKED_IN"] : ["CONFIRMED"];

	const [appointmentsResponse, doctorsResponse] = await Promise.all([
		AppointmentService.getAppointments({
			date: today,
			status,
			doctorId: query.doctorId,
			searchTerm: query.searchTerm,
			sortBy: "startAt",
			sortOrder: "asc",
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

	const subtitle = [
		formatDayLabel(today),
		selectedDoctor?.name,
		includeArrived ? `${meta.total} appointments` : `${meta.total} not arrived yet`,
	]
		.filter(Boolean)
		.join(" · ");

	return (
		<div className="space-y-5">
			<div className="space-y-1">
				<PageHeader title="Check-in" count={meta.total} />
				<p className="text-sm text-muted-foreground">{subtitle}</p>
			</div>

			<CheckInToolbar doctors={doctors} doctorId={query.doctorId} show={query.show} />

			<CheckInList
				appointments={appointmentsResponse.data}
				searchTerm={query.searchTerm}
				hasFilters={!!query.doctorId || query.show === "all"}
			/>

			<CheckInPagination meta={meta} />
		</div>
	);
}

function CheckInSkeleton() {
	return (
		<div className="space-y-5">
			<Skeleton className="h-8 w-40" />
			<Skeleton className="h-16 w-full rounded-xl" />
			<div className="space-y-3">
				{Array.from({ length: 5 }, (_, index) => (
					<Skeleton key={index} className="h-24 w-full rounded-xl" />
				))}
			</div>
		</div>
	);
}
