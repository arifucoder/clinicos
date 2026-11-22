"use client";

import { deleteDoctorAction, toggleDoctorStatusAction } from "@/actions/doctor.action";
import { EmptyState } from "@/components/shared/EmptyState";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { DataTableSearch } from "@/components/shared/data-table/DataTableSearch";
import { FilterChip } from "@/components/shared/data-table/FilterChip";
import type { PaginationMeta } from "@/types/api.types";
import type { SpecialtyRef, StaffDoctor } from "@/types/doctor.types";
import { STAFF_PAGE_SIZES } from "@/zod/admin.validation";
import type { DoctorListQuery } from "@/zod/doctor.validation";
import { SearchX, Stethoscope } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { DeleteStaffDialog } from "./DeleteStaffDialog";
import { DoctorFormDialog } from "./DoctorFormDialog";
import { NewDoctorButton } from "./NewDoctorButton";
import { DOCTOR_MOBILE_COLUMNS, getDoctorColumns } from "./doctorColumns";
import { STATUS_OPTIONS } from "./staffFilters";

interface DoctorTableProps {
	data: StaffDoctor[];
	meta: PaginationMeta;
	query: DoctorListQuery;
	specialties: SpecialtyRef[];
}

export function DoctorTable({ data, meta, query, specialties }: DoctorTableProps) {
	const [editTarget, setEditTarget] = useState<StaffDoctor | null>(null);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<StaffDoctor | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [busyId, setBusyId] = useState<string | null>(null);
	const [, startToggle] = useTransition();

	const columns = getDoctorColumns({
		busyId,
		onEdit: (doctor) => {
			setEditTarget(doctor);
			setEditOpen(true);
		},
		onDelete: (doctor) => {
			setDeleteTarget(doctor);
			setDeleteOpen(true);
		},
		onToggleActive: (doctor) => {
			setBusyId(doctor.id);
			startToggle(async () => {
				const result = await toggleDoctorStatusAction(doctor.id, !doctor.user.isActive);
				setBusyId(null);
				if (result.success) toast.success(result.message);
				else toast.error(result.message);
			});
		},
	});

	// api specialty filter নেয় slug দিয়ে (doctorListConfig)
	const specialtyOptions = specialties.map((specialty) => ({ label: specialty.name, value: specialty.slug }));
	const hasFilters = !!query.searchTerm || !!query.isActive || !!query.specialty;

	const emptyState =
		meta.total > 0 ? (
			<EmptyState icon={SearchX} title="Nothing on this page" description="Use the pagination below to go back." />
		) : hasFilters ? (
			<EmptyState
				icon={SearchX}
				title="No matching doctors"
				description="Try another name, email or license, or clear the filters."
			/>
		) : (
			<EmptyState
				icon={Stethoscope}
				title="No doctors yet"
				description="Add a doctor so patients can book them."
				action={<NewDoctorButton specialties={specialties} />}
			/>
		);

	return (
		<>
			<DataTable
				columns={columns}
				data={data}
				meta={meta}
				sort={{ sortBy: query.sortBy, sortOrder: query.sortOrder }}
				pageSizes={STAFF_PAGE_SIZES}
				mobileColumns={DOCTOR_MOBILE_COLUMNS}
				emptyState={emptyState}
				toolbar={
					<>
						<DataTableSearch placeholder="Search name, email, phone or license" />
						<FilterChip label="Status" paramKey="isActive" options={STATUS_OPTIONS} />
						{specialtyOptions.length > 0 && (
							<FilterChip label="Specialty" paramKey="specialty" options={specialtyOptions} />
						)}
					</>
				}
			/>

			<DoctorFormDialog open={editOpen} onOpenChange={setEditOpen} doctor={editTarget} specialties={specialties} />
			<DeleteStaffDialog
				kind="doctor"
				// doctor.id = profile id (api এটাই চায়), নাম আসে user থেকে
				target={deleteTarget && { id: deleteTarget.id, name: deleteTarget.user.name }}
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				deleteAction={deleteDoctorAction}
			/>
		</>
	);
}
