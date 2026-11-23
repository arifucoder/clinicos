"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import { DOCTOR_SORTS } from "@/lib/findDoctor";
import { DOCTOR_SORT_KEYS, type DoctorSortKey } from "@/zod/doctor.validation";

export function DoctorSortSelect({ sort }: { sort: DoctorSortKey }) {
	const { setParams, isPending } = useTableUrlState();

	return (
		<div className="flex items-center gap-2.5">
			<span id="doctor-sort-label" className="hidden text-[13px] text-body sm:inline">
				Sort by
			</span>
			<Select
				value={sort}
				disabled={isPending}
				onValueChange={(value) => {
					if (typeof value === "string") setParams({ sort: value === "name" ? null : value }, { resetPage: true });
				}}
			>
				<SelectTrigger aria-labelledby="doctor-sort-label" aria-label="Sort doctors" className="h-10 w-full bg-card sm:w-48">
					<SelectValue>{(value: DoctorSortKey) => DOCTOR_SORTS[value].label}</SelectValue>
				</SelectTrigger>
				<SelectContent align="end">
					{DOCTOR_SORT_KEYS.map((key) => (
						<SelectItem key={key} value={key}>
							{DOCTOR_SORTS[key].label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
