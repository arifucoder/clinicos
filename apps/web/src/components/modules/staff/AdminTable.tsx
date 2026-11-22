"use client";

import { toggleAdminStatusAction } from "@/actions/admin.action";
import { EmptyState } from "@/components/shared/EmptyState";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { DataTableSearch } from "@/components/shared/data-table/DataTableSearch";
import { FilterChip } from "@/components/shared/data-table/FilterChip";
import type { StaffAdmin } from "@/types/admin.types";
import type { PaginationMeta } from "@/types/api.types";
import { type AdminListQuery, STAFF_PAGE_SIZES } from "@/zod/admin.validation";
import { SearchX, UserCog } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ADMIN_MOBILE_COLUMNS, getAdminColumns } from "./adminColumns";

interface AdminTableProps {
	data: StaffAdmin[];
	meta: PaginationMeta;
	query: AdminListQuery;
}

const STATUS_OPTIONS = [
	{ label: "Active", value: "true" },
	{ label: "Inactive", value: "false" },
];

export function AdminTable({ data, meta, query }: AdminTableProps) {
	const [busyId, setBusyId] = useState<string | null>(null);
	const [, startToggle] = useTransition();

	const columns = getAdminColumns({
		busyId,
		onToggleActive: (admin) => {
			setBusyId(admin.id);
			startToggle(async () => {
				const result = await toggleAdminStatusAction(admin.id, !admin.isActive);
				setBusyId(null);
				if (result.success) toast.success(result.message);
				else toast.error(result.message);
			});
		},
	});

	const hasFilters = !!query.searchTerm || !!query.isActive;

	const emptyState =
		meta.total > 0 ? (
			<EmptyState icon={SearchX} title="Nothing on this page" description="Use the pagination below to go back." />
		) : hasFilters ? (
			<EmptyState
				icon={SearchX}
				title="No matching admins"
				description="Try another name or email, or clear the filters."
			/>
		) : (
			<EmptyState
				icon={UserCog}
				title="No admins yet"
				description="Add an admin to share front-desk and manager work."
			/>
		);

	return (
		<DataTable
			columns={columns}
			data={data}
			meta={meta}
			sort={{ sortBy: query.sortBy, sortOrder: query.sortOrder }}
			pageSizes={STAFF_PAGE_SIZES}
			mobileColumns={ADMIN_MOBILE_COLUMNS}
			emptyState={emptyState}
			toolbar={
				<>
					<DataTableSearch placeholder="Search name, email or phone" />
					<FilterChip label="Status" paramKey="isActive" options={STATUS_OPTIONS} />
				</>
			}
		/>
	);
}
