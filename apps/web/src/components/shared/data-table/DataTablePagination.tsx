"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { useTableUrlState } from "@/hooks/useTableUrlState";
import type { PaginationMeta } from "@/types/api.types";
import { cn } from "cn";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

// 1 … 4 5 6 … 20
const getPageNumbers = (current: number, total: number): (number | "ellipsis")[] => {
	if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

	const pages = [...new Set([1, current - 1, current, current + 1, total])]
		.filter((page) => page >= 1 && page <= total)
		.toSorted((a, b) => a - b);

	const result: (number | "ellipsis")[] = [];
	let previous = 0;
	for (const page of pages) {
		if (page - previous > 1) result.push("ellipsis");
		result.push(page);
		previous = page;
	}
	return result;
};

interface DataTablePaginationProps {
	meta: PaginationMeta;
	pageSizes: readonly number[];
	setParams: ReturnType<typeof useTableUrlState>["setParams"];
}

export function DataTablePagination({ meta, pageSizes, setParams }: DataTablePaginationProps) {
	const { page, limit, total, totalPages } = meta;
	const from = (page - 1) * limit + 1;
	const to = Math.min(page * limit, total);
	const goTo = (target: number) => setParams({ page: target === 1 ? null : target });

	return (
		<nav
			aria-label="Pagination"
			className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-[13px] text-body"
		>
			<div className="flex items-center gap-3">
				<span className="hidden sm:inline">Rows per page</span>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button variant="outline" size="sm" className="gap-1 px-2.5 tabular-nums" aria-label="Rows per page" />
						}
					>
						{limit}
						<ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-20">
						{pageSizes.map((size) => (
							<DropdownMenuItem key={size} onClick={() => setParams({ limit: size }, { resetPage: true })}>
								{size}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
				<span className="tabular-nums">
					{from}–{to} of {total.toLocaleString("en-US")}
				</span>
			</div>

			<div className="flex items-center gap-1">
				<Button
					variant="outline"
					size="icon-sm"
					onClick={() => goTo(page - 1)}
					disabled={page <= 1}
					aria-label="Previous page"
				>
					<ChevronLeft />
				</Button>

				{getPageNumbers(page, totalPages).map((item, index) =>
					item === "ellipsis" ? (
						// biome-ignore: ellipsis-এর আলাদা id নেই
						<span key={`ellipsis-${index}`} className="px-1.5 text-muted-foreground" aria-hidden="true">
							…
						</span>
					) : (
						<Button
							key={item}
							variant="ghost"
							size="icon-sm"
							onClick={() => goTo(item)}
							aria-label={`Page ${item}`}
							aria-current={item === page ? "page" : undefined}
							className={cn(
								"tabular-nums",
								item === page && "bg-primary-soft font-semibold text-primary-hover hover:bg-primary-soft",
							)}
						>
							{item}
						</Button>
					),
				)}

				<Button
					variant="outline"
					size="icon-sm"
					onClick={() => goTo(page + 1)}
					disabled={page >= totalPages}
					aria-label="Next page"
				>
					<ChevronRight />
				</Button>
			</div>
		</nav>
	);
}
