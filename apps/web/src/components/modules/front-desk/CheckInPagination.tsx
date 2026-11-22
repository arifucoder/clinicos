"use client";

import { DataTablePagination } from "@/components/shared/data-table/DataTablePagination";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import type { PaginationMeta } from "@/types/api.types";
import { CHECK_IN_PAGE_SIZES } from "@/zod/appointment.validation";

// DataTable-এর ভেতরের pagination-টাই আলাদা করে ব্যবহার (card list-এর জন্য)
export function CheckInPagination({ meta }: { meta: PaginationMeta }) {
	const { setParams } = useTableUrlState();
	if (meta.total === 0) return null;

	return (
		<div className="rounded-xl border border-border bg-card shadow-card">
			<DataTablePagination meta={meta} pageSizes={CHECK_IN_PAGE_SIZES} setParams={setParams} />
		</div>
	);
}
