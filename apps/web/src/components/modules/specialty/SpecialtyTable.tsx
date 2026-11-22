"use client";

import { toggleSpecialtyStatusAction } from "@/actions/specialty.action";
import { EmptyState } from "@/components/shared/EmptyState";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { DataTableSearch } from "@/components/shared/data-table/DataTableSearch";
import { FilterChip } from "@/components/shared/data-table/FilterChip";
import type { PaginationMeta } from "@/types/api.types";
import type { Specialty } from "@/types/specialty.types";
import { SPECIALTY_PAGE_SIZES, type SpecialtyListQuery } from "@/zod/specialty.validation";
import { SearchX, Tags } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { DeleteSpecialtyDialog } from "./DeleteSpecialtyDialog";
import { NewSpecialtyButton } from "./NewSpecialtyButton";
import { SpecialtyFormDialog } from "./SpecialtyFormDialog";
import { getSpecialtyColumns } from "./specialtyColumns";

interface SpecialtyTableProps {
	data: Specialty[];
	meta: PaginationMeta;
	query: SpecialtyListQuery;
}

const STATUS_OPTIONS = [
	{ label: "Active", value: "true" },
	{ label: "Inactive", value: "false" },
];

export function SpecialtyTable({ data, meta, query }: SpecialtyTableProps) {
	// target আর open আলাদা: বন্ধ হওয়ার animation-এর সময় title হঠাৎ "New specialty" হয়ে যায় না
	const [editTarget, setEditTarget] = useState<Specialty | null>(null);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<Specialty | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [busyId, setBusyId] = useState<string | null>(null);
	const [, startToggle] = useTransition();

	const columns = getSpecialtyColumns({
		busyId,
		onEdit: (specialty) => {
			setEditTarget(specialty);
			setEditOpen(true);
		},
		onDelete: (specialty) => {
			setDeleteTarget(specialty);
			setDeleteOpen(true);
		},
		onToggleActive: (specialty) => {
			setBusyId(specialty.id);
			startToggle(async () => {
				const result = await toggleSpecialtyStatusAction(specialty.id, !specialty.isActive);
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
				title="No matching specialties"
				description="Try a different name or clear the filters."
			/>
		) : (
			<EmptyState
				icon={Tags}
				title="No specialties yet"
				description="Add the first one so you can assign it to doctors."
				action={<NewSpecialtyButton />}
			/>
		);

	return (
		<>
			<DataTable
				columns={columns}
				data={data}
				meta={meta}
				sort={{ sortBy: query.sortBy, sortOrder: query.sortOrder }}
				pageSizes={SPECIALTY_PAGE_SIZES}
				emptyState={emptyState}
				toolbar={
					<>
						<DataTableSearch placeholder="Search name or description" />
						<FilterChip label="Status" paramKey="isActive" options={STATUS_OPTIONS} />
					</>
				}
			/>

			<SpecialtyFormDialog open={editOpen} onOpenChange={setEditOpen} specialty={editTarget} />
			<DeleteSpecialtyDialog open={deleteOpen} onOpenChange={setDeleteOpen} specialty={deleteTarget} />
		</>
	);
}
