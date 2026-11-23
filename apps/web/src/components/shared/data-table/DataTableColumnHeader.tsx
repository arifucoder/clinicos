"use client";

import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";

interface SortableColumn {
	getCanSort: () => boolean;
	getIsSorted: () => false | "asc" | "desc";
	toggleSorting: (desc?: boolean) => void;
}

interface DataTableColumnHeaderProps {
	column: SortableColumn;
	title: string;
}

export function DataTableColumnHeader({ column, title }: DataTableColumnHeaderProps) {
	if (!column.getCanSort()) return <span>{title}</span>;

	const sorted = column.getIsSorted();

	return (
		<button
			type="button"
			onClick={() => column.toggleSorting(sorted === "asc")}
			className="-ml-1 inline-flex items-center gap-1 rounded px-1 py-0.5 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[sorted=true]:text-foreground"
			data-sorted={!!sorted}
		>
			{title}
			{sorted === "asc" ? (
				<ChevronUp className="size-3.5 text-primary" aria-hidden="true" />
			) : sorted === "desc" ? (
				<ChevronDown className="size-3.5 text-primary" aria-hidden="true" />
			) : (
				<ChevronsUpDown className="size-3.5 text-slate-300" aria-hidden="true" />
			)}
		</button>
	);
}
