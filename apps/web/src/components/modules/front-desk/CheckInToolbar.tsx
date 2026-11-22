"use client";

import { DoctorPicker } from "@/components/modules/slot/DoctorPicker";
import { DataTableSearch } from "@/components/shared/data-table/DataTableSearch";
import { Button } from "@/components/ui/button";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import type { SlotDoctorOption } from "@/types/slot.types";
import type { CheckInQuery } from "@/zod/appointment.validation";
import { cn } from "cn";
import { X } from "lucide-react";

const SHOW_OPTIONS: { label: string; value: CheckInQuery["show"] }[] = [
	{ label: "Not arrived", value: "waiting" },
	{ label: "All", value: "all" },
];

interface CheckInToolbarProps {
	doctors: SlotDoctorOption[];
	doctorId?: string;
	show: CheckInQuery["show"];
}

export function CheckInToolbar({ doctors, doctorId, show }: CheckInToolbarProps) {
	const { setParams } = useTableUrlState();

	return (
		<div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-card sm:flex-row sm:flex-wrap sm:items-center">
			<DataTableSearch placeholder="Search name, phone or appointment no." />

			<div className="flex items-center gap-1">
				<DoctorPicker doctors={doctors} value={doctorId} />
				{doctorId && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setParams({ doctorId: null }, { resetPage: true })}
						aria-label="Show all doctors"
					>
						<X aria-hidden="true" />
						All doctors
					</Button>
				)}
			</div>

			{/* default ("waiting") URL-এ রাখি না → URL ছোট থাকে */}
			<div
				role="group"
				aria-label="Show"
				className="inline-flex w-fit rounded-md border border-border p-0.5 sm:ml-auto"
			>
				{SHOW_OPTIONS.map((option) => (
					<button
						key={option.value}
						type="button"
						aria-pressed={show === option.value}
						onClick={() => setParams({ show: option.value === "waiting" ? null : option.value }, { resetPage: true })}
						className={cn(
							"h-8 rounded px-3 text-sm transition-colors",
							show === option.value
								? "bg-primary-soft font-medium text-primary-hover"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						{option.label}
					</button>
				))}
			</div>
		</div>
	);
}
