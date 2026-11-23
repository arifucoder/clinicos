import { NewSpecialtyButton } from "@/components/modules/specialty/NewSpecialtyButton";
import { SpecialtyTable } from "@/components/modules/specialty/SpecialtyTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTableSkeleton } from "@/components/shared/data-table/DataTableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { SpecialtyService } from "@/services/specialty.service";
import { specialtyListQuerySchema } from "@/zod/specialty.validation";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Specialties" };

type SearchParams = PageProps<"/admin/specialties">["searchParams"];

export default function AdminSpecialtiesPage({ searchParams }: PageProps<"/admin/specialties">) {
	return (
		<Suspense fallback={<SpecialtiesSkeleton />}>
			<SpecialtiesContent searchParams={searchParams} />
		</Suspense>
	);
}

async function SpecialtiesContent({ searchParams }: { searchParams: SearchParams }) {
	const query = specialtyListQuerySchema.parse(await searchParams);
	const response = await SpecialtyService.getSpecialties(query);
	const meta = response.meta ?? { page: query.page, limit: query.limit, total: response.data.length, totalPages: 1 };

	return (
		<div className="space-y-5">
			<PageHeader title="Specialties" count={meta.total} actions={<NewSpecialtyButton />} />
			<SpecialtyTable data={response.data} meta={meta} query={query} />
		</div>
	);
}

function SpecialtiesSkeleton() {
	return (
		<div className="space-y-5">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-10 w-36" />
			</div>
			<DataTableSkeleton rows={8} columns={5} />
		</div>
	);
}
