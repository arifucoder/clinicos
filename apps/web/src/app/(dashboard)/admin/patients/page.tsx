import { NewPatientButton } from "@/components/modules/patient/NewPatientButton";
import { PatientTable } from "@/components/modules/patient/PatientTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTableSkeleton } from "@/components/shared/data-table/DataTableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { clinicToday } from "@/lib/clinicDate";
import { PatientService } from "@/services/patient.service";
import { patientListQuerySchema } from "@/zod/patient.validation";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Patients" };

type SearchParams = PageProps<"/admin/patients">["searchParams"];

export default function AdminPatientsPage({ searchParams }: PageProps<"/admin/patients">) {
	return (
		<Suspense fallback={<PatientsSkeleton />}>
			<PatientsContent searchParams={searchParams} />
		</Suspense>
	);
}

async function PatientsContent({ searchParams }: { searchParams: SearchParams }) {
	const query = patientListQuerySchema.parse(await searchParams);
	const response = await PatientService.getPatients(query);
	const meta = response.meta ?? { page: query.page, limit: query.limit, total: response.data.length, totalPages: 1 };
	const today = clinicToday(new Date());

	return (
		<div className="space-y-5">
			<PageHeader title="Patients" count={meta.total} actions={<NewPatientButton />} />
			<PatientTable data={response.data} meta={meta} query={query} today={today} />
		</div>
	);
}

function PatientsSkeleton() {
	return (
		<div className="space-y-5">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-40" />
				<Skeleton className="h-10 w-36" />
			</div>
			<DataTableSkeleton rows={8} columns={6} />
		</div>
	);
}
