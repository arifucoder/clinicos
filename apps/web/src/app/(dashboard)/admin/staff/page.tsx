import { AdminTable } from "@/components/modules/staff/AdminTable";
import { DoctorTable } from "@/components/modules/staff/DoctorTable";
import { NewAdminButton } from "@/components/modules/staff/NewAdminButton";
import { NewDoctorButton } from "@/components/modules/staff/NewDoctorButton";
import { StaffTabs } from "@/components/modules/staff/StaffTabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTableSkeleton } from "@/components/shared/data-table/DataTableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/currentUser";
import { AdminService } from "@/services/admin.service";
import { DoctorService } from "@/services/doctor.service";
import { SpecialtyService } from "@/services/specialty.service";
import type { PaginationMeta } from "@/types/api.types";
import type { SpecialtyRef } from "@/types/doctor.types";
import { adminListQuerySchema, staffTabSchema } from "@/zod/admin.validation";
import { doctorListQuerySchema } from "@/zod/doctor.validation";
import { specialtyListQuerySchema } from "@/zod/specialty.validation";
import type { Metadata } from "next";
import { type ReactNode, Suspense } from "react";

export const metadata: Metadata = { title: "Staff" };

type SearchParams = PageProps<"/admin/staff">["searchParams"];
type Params = Awaited<SearchParams>;

// form আর filter-এর জন্য: সব active specialty, নাম অনুযায়ী
const ACTIVE_SPECIALTIES_QUERY = specialtyListQuerySchema.parse({
	isActive: "true",
	limit: 100,
	sortBy: "name",
	sortOrder: "asc",
});

const fallbackMeta = (query: { page: number; limit: number }, total: number): PaginationMeta => ({
	page: query.page,
	limit: query.limit,
	total,
	totalPages: 1,
});

export default function AdminStaffPage({ searchParams }: PageProps<"/admin/staff">) {
	return (
		<Suspense fallback={<StaffSkeleton />}>
			<StaffContent searchParams={searchParams} />
		</Suspense>
	);
}

async function StaffContent({ searchParams }: { searchParams: SearchParams }) {
	const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
	const isSuperAdmin = user?.role === "SUPER_ADMIN";
	// ADMIN ?tab=admins লিখলেও doctors দেখবে (UI-র সুবিধা; আসল বাধা api-র 403)
	const tab = isSuperAdmin ? staffTabSchema.parse(params.tab) : "doctors";
	const tabs = <StaffTabs active={tab} showAdmins={isSuperAdmin} />;

	return tab === "admins" ? (
		<AdminsSection params={params} tabs={tabs} />
	) : (
		<DoctorsSection params={params} tabs={tabs} />
	);
}

async function AdminsSection({ params, tabs }: { params: Params; tabs: ReactNode }) {
	const query = adminListQuerySchema.parse(params);
	const response = await AdminService.getAdmins(query);
	const meta = response.meta ?? fallbackMeta(query, response.data.length);

	return (
		<div className="space-y-5">
			<PageHeader title="Staff" count={meta.total} actions={<NewAdminButton />} />
			{tabs}
			<AdminTable data={response.data} meta={meta} query={query} />
		</div>
	);
}

async function DoctorsSection({ params, tabs }: { params: Params; tabs: ReactNode }) {
	const query = doctorListQuerySchema.parse(params);
	// দুটো আলাদা call, একটা আরেকটার উপর নির্ভর করে না → একসাথে
	const [doctors, specialtyResponse] = await Promise.all([
		DoctorService.getDoctors(query),
		SpecialtyService.getSpecialties(ACTIVE_SPECIALTIES_QUERY),
	]);
	const meta = doctors.meta ?? fallbackMeta(query, doctors.data.length);
	// client-এ শুধু যা লাগে (description, icon পাঠাই না)
	const specialties: SpecialtyRef[] = specialtyResponse.data.map(({ id, name, slug }) => ({ id, name, slug }));

	return (
		<div className="space-y-5">
			<PageHeader title="Staff" count={meta.total} actions={<NewDoctorButton specialties={specialties} />} />
			{tabs}
			<DoctorTable data={doctors.data} meta={meta} query={query} specialties={specialties} />
		</div>
	);
}

function StaffSkeleton() {
	return (
		<div className="space-y-5">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-40" />
				<Skeleton className="h-10 w-32" />
			</div>
			<Skeleton className="h-9 w-56" />
			<DataTableSkeleton rows={8} columns={6} />
		</div>
	);
}
