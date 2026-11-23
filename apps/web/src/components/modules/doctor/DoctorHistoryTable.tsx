"use client";

import { DataTable } from "@/components/shared/data-table/DataTable";
import { DataTableSearch } from "@/components/shared/data-table/DataTableSearch";
import { FilterChip } from "@/components/shared/data-table/FilterChip";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import { APPOINTMENT_STATUS_META } from "@/lib/appointmentDisplay";
import type { PaginationMeta } from "@/types/api.types";
import type { Appointment } from "@/types/appointment.types";
import {
	DOCTOR_HISTORY_PAGE_SIZES,
	DOCTOR_HISTORY_STATUSES,
	type DoctorHistoryQuery,
} from "@/zod/appointment.validation";
import { History, SearchX, X } from "lucide-react";
import { DOCTOR_HISTORY_MOBILE_COLUMNS, doctorHistoryColumns } from "./doctorHistoryColumns";

// শুধু history-র status → URL-এ CONFIRMED বসানোর option-ই থাকে না
const STATUS_OPTIONS = DOCTOR_HISTORY_STATUSES.map((value) => ({
	value,
	label: APPOINTMENT_STATUS_META[value].label,
}));

interface DoctorHistoryTableProps {
	data: Appointment[];
	meta: PaginationMeta;
	query: DoctorHistoryQuery;
}

export function DoctorHistoryTable({ data, meta, query }: DoctorHistoryTableProps) {
	const { setParams } = useTableUrlState();
	const hasFilters = !!(query.searchTerm || query.status || query.patientId);
	// নাম আলাদা করে আনি না: filter-এর সব row একই রোগীর
	const patientName = query.patientId ? data[0]?.patient.fullName : undefined;

	const emptyState =
		meta.total > 0 ? (
			<EmptyState icon={SearchX} title="Nothing on this page" description="Use the pagination below to go back." />
		) : hasFilters ? (
			<EmptyState
				icon={SearchX}
				title="No matching appointments"
				description="Try another name, phone or appointment no., or clear the status filter."
			/>
		) : (
			<EmptyState
				icon={History}
				title="No history yet"
				description="Completed, missed and cancelled appointments will show up here."
			/>
		);

	return (
		<DataTable
			columns={doctorHistoryColumns}
			data={data}
			meta={meta}
			sort={{ sortBy: query.sortBy, sortOrder: query.sortOrder }}
			pageSizes={DOCTOR_HISTORY_PAGE_SIZES}
			mobileColumns={DOCTOR_HISTORY_MOBILE_COLUMNS}
			emptyState={emptyState}
			toolbar={
				<>
					<DataTableSearch placeholder="Search name, phone or appointment no." />
					<FilterChip label="Status" paramKey="status" options={STATUS_OPTIONS} />
					{query.patientId && (
						<Button
							variant="secondary"
							size="sm"
							onClick={() => setParams({ patientId: null }, { resetPage: true })}
							aria-label="Show all patients"
						>
							{patientName ?? "One patient"}
							<X aria-hidden="true" />
						</Button>
					)}
				</>
			}
		/>
	);
}
