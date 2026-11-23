"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTableUrlState } from "@/hooks/useTableUrlState";

export interface SpecialtyOption {
	name: string;
	slug: string;
	doctorCount: number;
}

const ALL = "all";

export function SpecialtySelect({ specialties, specialty }: { specialties: SpecialtyOption[]; specialty?: string }) {
	const { setParams, isPending } = useTableUrlState();
	const labelFor = (value: string) =>
		value === ALL ? "All specialties" : (specialties.find((option) => option.slug === value)?.name ?? "All specialties");

	return (
		<Select
			value={specialty ?? ALL}
			disabled={isPending}
			onValueChange={(value) => {
				if (typeof value === "string") setParams({ specialty: value === ALL ? null : value }, { resetPage: true });
			}}
		>
			<SelectTrigger aria-label="Specialty" className="h-12! w-full bg-card px-4 text-[15px] sm:w-52">
				<SelectValue>{(value: string) => labelFor(value)}</SelectValue>
			</SelectTrigger>
			<SelectContent align="end">
				<SelectItem value={ALL}>All specialties</SelectItem>
				{specialties.map((option) => (
					<SelectItem key={option.slug} value={option.slug}>
						<span className="flex w-full items-center justify-between gap-4">
							{option.name}
							<span className="text-xs text-muted-foreground tabular-nums">{option.doctorCount}</span>
						</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
