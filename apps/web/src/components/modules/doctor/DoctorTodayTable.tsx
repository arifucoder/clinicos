"use client";

import { DataTable } from "@/components/shared/data-table/DataTable";
import { DataTableSearch } from "@/components/shared/data-table/DataTableSearch";
import { EmptyState } from "@/components/shared/EmptyState";
import { DOCTOR_TAB_CONFIG } from "@/lib/doctorToday";
import type { PaginationMeta } from "@/types/api.types";
import type { Appointment } from "@/types/appointment.types";
import { DOCTOR_TODAY_PAGE_SIZES, type DoctorTodayQuery, type DoctorTodayTab } from "@/zod/appointment.validation";
import { CalendarCheck, ClipboardCheck, type LucideIcon, SearchX, UserRoundCheck } from "lucide-react";
import { DOCTOR_TODAY_MOBILE_COLUMNS, doctorTodayColumns } from "./doctorTodayColumns";

const EMPTY_ICON: Record<DoctorTodayTab, LucideIcon> = {
	waiting: UserRoundCheck,
	"not-arrived": CalendarCheck,
	completed: ClipboardCheck,
};

interface DoctorTodayTableProps {
	data: Appointment[];
	meta: PaginationMeta;
	query: DoctorTodayQuery;
}

export function DoctorTodayTable({ data, meta, query }: DoctorTodayTableProps) {
	const config = DOCTOR_TAB_CONFIG[query.tab];

	const emptyState =
		meta.total > 0 ? (
			<EmptyState icon={SearchX} title="Nothing on this page" description="Use the pagination below to go back." />
		) : query.searchTerm ? (
			<EmptyState
				icon={SearchX}
				title="No matching patients"
				description={`No one in "${config.label}" matches "${query.searchTerm}". Try a name, phone or appointment no.`}
			/>
		) : (
			<EmptyState icon={EMPTY_ICON[query.tab]} title={config.emptyTitle} description={config.emptyDescription} />
		);

	return (
		<DataTable
			columns={doctorTodayColumns}
			data={data}
			meta={meta}
			sort={{ sortBy: "startAt", sortOrder: config.sortOrder }}
			pageSizes={DOCTOR_TODAY_PAGE_SIZES}
			mobileColumns={DOCTOR_TODAY_MOBILE_COLUMNS}
			emptyState={emptyState}
			toolbar={
				<DataTableSearch key={query.tab} placeholder="Search name, phone or appointment no." />
			}
		/>
	);
}
