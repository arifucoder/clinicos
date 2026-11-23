"use client";

import { useTableUrlState } from "@/hooks/useTableUrlState";
import type { SlotDoctorOption } from "@/types/slot.types";
import { Combobox } from "@base-ui/react/combobox";
import { CheckIcon, ChevronDownIcon, Loader2 } from "lucide-react";

interface DoctorPickerProps {
	doctors: SlotDoctorOption[];
	value?: string;
}

const matchesDoctor = (doctor: SlotDoctorOption, query: string) => {
	const term = query.trim().toLowerCase();
	return term === "" || doctor.name.toLowerCase().includes(term) || doctor.specialties.toLowerCase().includes(term);
};

export function DoctorPicker({ doctors, value }: DoctorPickerProps) {
	const { setParams, isPending } = useTableUrlState();
	const selected = doctors.find((doctor) => doctor.id === value) ?? null;

	return (
		<Combobox.Root
			items={doctors}
			value={selected}
			onValueChange={(doctor) => {
				if (doctor) setParams({ doctorId: doctor.id }, { resetPage: true });
			}}
			itemToStringLabel={(doctor) => doctor.name}
			isItemEqualToValue={(item, current) => item.id === current.id}
			filter={matchesDoctor}
		>
			<div className="relative w-full sm:w-80">
				<Combobox.Input
					aria-label="Doctor"
					placeholder="Search doctor or specialty…"
					disabled={isPending}
					className="h-9 w-full rounded-md border border-input bg-card py-2 pr-9 pl-2.5 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
				/>
				<Combobox.Trigger
					aria-label="Show all doctors"
					className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground"
				>
					{isPending ? (
						<Loader2 className="size-4 animate-spin" aria-hidden="true" />
					) : (
						<ChevronDownIcon className="size-4" aria-hidden="true" />
					)}
				</Combobox.Trigger>
			</div>

			<Combobox.Portal>
				<Combobox.Positioner sideOffset={4} className="z-50">
					<Combobox.Popup className="max-h-80 w-(--anchor-width) overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
						<Combobox.Empty className="px-2 py-6 text-center text-sm text-muted-foreground empty:hidden">
							No doctor matches your search.
						</Combobox.Empty>
						<Combobox.List>
							{(doctor: SlotDoctorOption) => (
								<Combobox.Item
									key={doctor.id}
									value={doctor}
									className="flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
								>
									<span className="flex min-w-0 flex-1 flex-col">
										<span className="truncate">{doctor.name}</span>
										<span className="truncate text-xs text-muted-foreground">{doctor.specialties}</span>
									</span>
									<Combobox.ItemIndicator>
										<CheckIcon className="size-4 text-primary" aria-hidden="true" />
									</Combobox.ItemIndicator>
								</Combobox.Item>
							)}
						</Combobox.List>
					</Combobox.Popup>
				</Combobox.Positioner>
			</Combobox.Portal>
		</Combobox.Root>
	);
}
