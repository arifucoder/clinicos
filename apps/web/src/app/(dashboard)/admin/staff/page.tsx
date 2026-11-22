import { AdminTable } from "@/components/modules/staff/AdminTable";
import { StaffTabs } from "@/components/modules/staff/StaffTabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTableSkeleton } from "@/components/shared/data-table/DataTableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/currentUser";
import { AdminService } from "@/services/admin.service";
import { adminListQuerySchema, staffTabSchema } from "@/zod/admin.validation";
import { Stethoscope } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Staff" };

type SearchParams = PageProps<"/admin/staff">["searchParams"];

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

	if (tab === "doctors") {
		return (
			<div className="space-y-5">
				<PageHeader title="Staff" />
				<StaffTabs active={tab} showAdmins={isSuperAdmin} />
				<EmptyState icon={Stethoscope} title="Doctors" description="Doctor list comes in the next step." />
			</div>
		);
	}

	const query = adminListQuerySchema.parse(params);
	const response = await AdminService.getAdmins(query);
	const meta = response.meta ?? { page: query.page, limit: query.limit, total: response.data.length, totalPages: 1 };

	return (
		<div className="space-y-5">
			<PageHeader title="Staff" count={meta.total} />
			<StaffTabs active={tab} showAdmins={isSuperAdmin} />
			<AdminTable data={response.data} meta={meta} query={query} />
		</div>
	);
}

function StaffSkeleton() {
	return (
		<div className="space-y-5">
			<Skeleton className="h-8 w-40" />
			<Skeleton className="h-9 w-56" />
			<DataTableSkeleton rows={8} columns={5} />
		</div>
	);
}
