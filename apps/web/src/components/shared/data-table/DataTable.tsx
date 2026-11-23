"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import type { PaginationMeta } from "@/types/api.types";
import { type ColumnDef, type SortingState, useTable } from "@tanstack/react-table";
import { cn } from "cn";
import type { ReactNode } from "react";
import { type DataTableFeatures, dataTableFeatures } from "./dataTableFeatures";
import { DataTablePagination } from "./DataTablePagination";

interface DataTableProps<TData extends { id: string }> {
	columns: ColumnDef<DataTableFeatures, TData>[];
	data: TData[];
	meta: PaginationMeta;
	sort: { sortBy: string; sortOrder: "asc" | "desc" };
	toolbar?: ReactNode;
	emptyState: ReactNode;
	pageSizes?: readonly number[];
	mobileColumns?: readonly string[];
}

export function DataTable<TData extends { id: string }>({
	columns,
	data,
	meta,
	sort,
	toolbar,
	emptyState,
	pageSizes = [10, 20, 50],
	mobileColumns,
}: DataTableProps<TData>) {
	const { setParams, isPending } = useTableUrlState();
	const sorting: SortingState = [{ id: sort.sortBy, desc: sort.sortOrder === "desc" }];
	const mobileClass = (columnId: string) =>
		mobileColumns && !mobileColumns.includes(columnId) ? "hidden md:table-cell" : undefined;
	const table = useTable({
		features: dataTableFeatures,
		columns,
		data,
		getRowId: (row) => row.id,
		manualSorting: true,
		enableSortingRemoval: false,
		defaultColumn: { enableSorting: false },
		state: { sorting },
		onSortingChange: (updater) => {
			const next = typeof updater === "function" ? updater(sorting) : updater;
			const first = next[0];
			if (!first) return;
			setParams({ sortBy: first.id, sortOrder: first.desc ? "desc" : "asc" }, { resetPage: true });
		},
	});

	return (
		<section className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
			{toolbar && <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">{toolbar}</div>}

			<div aria-busy={isPending} className={cn("transition-opacity", isPending && "opacity-60")}>
				{data.length === 0 ? (
					emptyState
				) : (
					<Table>
						<TableHeader className="bg-surface">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id} className="hover:bg-transparent">
									{headerGroup.headers.map((header) => {
										const sorted = header.column.getIsSorted();
										return (
											<TableHead
												key={header.id}
												aria-sort={
													header.column.getCanSort()
														? sorted === "asc"
															? "ascending"
															: sorted === "desc"
																? "descending"
																: "none"
														: undefined
												}
												className={cn(
													"h-10 px-3 text-xs font-semibold text-muted-foreground first:pl-4 last:pr-4",
													mobileClass(header.column.id),
												)}
											>
												{header.isPlaceholder ? null : <table.FlexRender header={header} />}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} className="hover:bg-surface">
									{row.getAllCells().map((cell) => (
										<TableCell
											key={cell.id}
											className={cn("h-15 px-3 first:pl-4 last:pr-4", mobileClass(cell.column.id))}
										>
											<table.FlexRender cell={cell} />
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</div>

			{meta.total > 0 && <DataTablePagination meta={meta} pageSizes={pageSizes} setParams={setParams} />}
		</section>
	);
}
