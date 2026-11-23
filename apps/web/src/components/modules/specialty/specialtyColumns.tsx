import { DataTableColumnHeader } from "@/components/shared/data-table/DataTableColumnHeader";
import type { DataTableFeatures } from "@/components/shared/data-table/dataTableFeatures";
import { StatusPill } from "@/components/shared/StatusPill";
import { formatDate } from "@/lib/format";
import type { Specialty } from "@/types/specialty.types";
import type { ColumnDef } from "@tanstack/react-table";
import { SpecialtyRowActions, type SpecialtyRowHandlers } from "./SpecialtyRowActions";

export const getSpecialtyColumns = (handlers: SpecialtyRowHandlers): ColumnDef<DataTableFeatures, Specialty>[] => [
	{
		accessorKey: "name",
		enableSorting: true,
		header: ({ column }) => <DataTableColumnHeader column={column} title="Specialty" />,
		cell: ({ row }) => (
			<div className="min-w-40">
				<p className="font-medium text-foreground">{row.original.name}</p>
				<p className="font-mono text-xs text-muted-foreground">{row.original.slug}</p>
			</div>
		),
	},
	{
		accessorKey: "description",
		header: "Description",
		cell: ({ row }) =>
			row.original.description ? (
				<p className="line-clamp-2 max-w-md text-sm whitespace-normal text-body">{row.original.description}</p>
			) : (
				<span className="text-muted-foreground">—</span>
			),
	},
	{
		accessorKey: "isActive",
		header: "Status",
		cell: ({ row }) => (
			<StatusPill tone={row.original.isActive ? "success" : "neutral"}>
				{row.original.isActive ? "Active" : "Inactive"}
			</StatusPill>
		),
	},
	{
		accessorKey: "createdAt",
		enableSorting: true,
		header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
		cell: ({ row }) => (
			<span className="text-sm whitespace-nowrap text-body">{formatDate(row.original.createdAt)}</span>
		),
	},
	{
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: ({ row }) => (
			<div className="flex justify-end">
				<SpecialtyRowActions specialty={row.original} {...handlers} />
			</div>
		),
	},
];
