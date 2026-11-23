"use client";

import { togglePatientStatusAction } from "@/actions/patient.action";
import { STATUS_OPTIONS } from "@/components/modules/staff/staffFilters";
import { EmptyState } from "@/components/shared/EmptyState";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { DataTableSearch } from "@/components/shared/data-table/DataTableSearch";
import { FilterChip } from "@/components/shared/data-table/FilterChip";
import { BLOOD_GROUP_LABEL, GENDER_LABEL } from "@/lib/patientDisplay";
import type { PaginationMeta } from "@/types/api.types";
import type { PatientRecord } from "@/types/patient.types";
import { BLOOD_GROUPS, GENDERS, PATIENT_PAGE_SIZES, type PatientListQuery } from "@/zod/patient.validation";
import { SearchX, Users } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { NewPatientButton } from "./NewPatientButton";
import { ResetPasswordDialog } from "./ResetPasswordDialog";
import { PATIENT_MOBILE_COLUMNS, getPatientColumns } from "./patientColumns";

interface PatientTableProps {
	data: PatientRecord[];
	meta: PaginationMeta;
	query: PatientListQuery;
	today: string;
}

const GENDER_OPTIONS = GENDERS.map((value) => ({ value, label: GENDER_LABEL[value] }));
const BLOOD_GROUP_OPTIONS = BLOOD_GROUPS.map((value) => ({ value, label: BLOOD_GROUP_LABEL[value] }));

export function PatientTable({ data, meta, query, today }: PatientTableProps) {
	const [resetTarget, setResetTarget] = useState<PatientRecord | null>(null);
	const [resetOpen, setResetOpen] = useState(false);
	const [busyId, setBusyId] = useState<string | null>(null);
	const [, startToggle] = useTransition();

	const columns = getPatientColumns(today, {
		busyId,
		onResetPassword: (patient) => {
			setResetTarget(patient);
			setResetOpen(true);
		},
		onToggleActive: (patient) => {
			setBusyId(patient.id);
			startToggle(async () => {
				const result = await togglePatientStatusAction(patient.id, !patient.user.isActive);
				setBusyId(null);
				if (result.success) toast.success(result.message);
				else toast.error(result.message);
			});
		},
	});

	const hasFilters = !!(query.searchTerm || query.isActive || query.gender || query.bloodGroup);

	const emptyState =
		meta.total > 0 ? (
			<EmptyState icon={SearchX} title="Nothing on this page" description="Use the pagination below to go back." />
		) : hasFilters ? (
			<EmptyState
				icon={SearchX}
				title="No matching patients"
				description="Try another name, phone or email, or clear the filters."
			/>
		) : (
			<EmptyState
				icon={Users}
				title="No patients yet"
				description="Patients appear here when they sign up or when you register them at the desk."
				action={<NewPatientButton />}
			/>
		);

	return (
		<>
			<DataTable
				columns={columns}
				data={data}
				meta={meta}
				sort={{ sortBy: query.sortBy, sortOrder: query.sortOrder }}
				pageSizes={PATIENT_PAGE_SIZES}
				mobileColumns={PATIENT_MOBILE_COLUMNS}
				emptyState={emptyState}
				toolbar={
					<>
						<DataTableSearch placeholder="Search name, phone or email" />
						<FilterChip label="Account" paramKey="isActive" options={STATUS_OPTIONS} />
						<FilterChip label="Gender" paramKey="gender" options={GENDER_OPTIONS} />
						<FilterChip label="Blood group" paramKey="bloodGroup" options={BLOOD_GROUP_OPTIONS} />
					</>
				}
			/>

			<ResetPasswordDialog patient={resetTarget} open={resetOpen} onOpenChange={setResetOpen} />
		</>
	);
}
