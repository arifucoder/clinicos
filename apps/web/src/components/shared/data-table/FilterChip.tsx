"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import { ChevronDown, X } from "lucide-react";

export interface FilterOption {
	label: string;
	value: string;
}

interface FilterChipProps {
	label: string;
	paramKey: string;
	options: FilterOption[];
}

export function FilterChip({ label, paramKey, options }: FilterChipProps) {
	const { searchParams, setParams } = useTableUrlState();
	const active = options.find((option) => option.value === searchParams.get(paramKey));

	const menu = (
		<DropdownMenuContent align="start" className="w-44">
			{options.map((option) => (
				<DropdownMenuItem
					key={option.value}
					onClick={() => setParams({ [paramKey]: option.value }, { resetPage: true })}
				>
					{option.label}
				</DropdownMenuItem>
			))}
		</DropdownMenuContent>
	);

	// design: active chip = primary-soft + "×"; inactive = dashed border + chevron
	if (active) {
		return (
			<span className="inline-flex h-8 items-center gap-0.5 rounded-full border border-primary/20 bg-primary-soft pr-1 pl-3 text-[13px] font-medium text-primary-hover">
				<DropdownMenu>
					<DropdownMenuTrigger className="rounded outline-none focus-visible:ring-2 focus-visible:ring-ring">
						{label}: {active.label}
					</DropdownMenuTrigger>
					{menu}
				</DropdownMenu>
				{/* trigger-এর বাইরে আলাদা button: button-এর ভেতরে button রাখা যায় না */}
				<button
					type="button"
					aria-label={`Clear ${label} filter`}
					onClick={() => setParams({ [paramKey]: null }, { resetPage: true })}
					className="rounded-full p-1 outline-none hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring"
				>
					<X className="size-3" aria-hidden="true" />
				</button>
			</span>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<button
						type="button"
						className="inline-flex h-8 items-center gap-1 rounded-full border border-dashed border-slate-300 bg-card px-3 text-[13px] font-medium text-body outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
					/>
				}
			>
				{label}
				<ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
			</DropdownMenuTrigger>
			{menu}
		</DropdownMenu>
	);
}
