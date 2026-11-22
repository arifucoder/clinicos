import { DataTableColumnHeader } from "@/components/shared/data-table/DataTableColumnHeader";
import type { DataTableFeatures } from "@/components/shared/data-table/dataTableFeatures";
import { formatDate } from "@/lib/format";
import type { StaffAdmin } from "@/types/admin.types";
import type { ColumnDef } from "@tanstack/react-table";
import { StaffRowActions, type StaffRowHandlers } from "./StaffRowActions";
import { StaffStatus } from "./StaffStatus";

// mobile-এ শুধু এই দুটো column; বাকি তথ্য "name" cell-এর ভেতরে md:hidden হয়ে দেখায়
export const ADMIN_MOBILE_COLUMNS = ["name", "actions"] as const;

export const getAdminColumns = (handlers: StaffRowHandlers<StaffAdmin>): ColumnDef<DataTableFeatures, StaffAdmin>[] => [
	{
		accessorKey: "name",
		enableSorting: true,
		header: ({ column }) => <DataTableColumnHeader column={column} title="Admin" />,
		cell: ({ row }) => (
			<div className="min-w-0 space-y-1">
				<p className="font-medium text-foreground">{row.original.name}</p>
				<p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
				<div className="md:hidden">
					<StaffStatus {...row.original} />
				</div>
			</div>
		),
	},
	{
		accessorKey: "phone",
		header: "Phone",
		cell: ({ row }) =>
			row.original.phone ? (
				<span className="text-sm whitespace-nowrap text-body tabular-nums">{row.original.phone}</span>
			) : (
				<span className="text-muted-foreground">—</span>
			),
	},
	{
		accessorKey: "isActive",
		header: "Status",
		cell: ({ row }) => <StaffStatus {...row.original} />,
	},
	{
		accessorKey: "createdAt",
		enableSorting: true,
		header: ({ column }) => <DataTableColumnHeader column={column} title="Added" />,
		cell: ({ row }) => (
			<span className="text-sm whitespace-nowrap text-body">{formatDate(row.original.createdAt)}</span>
		),
	},
	{
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: ({ row }) => {
			const admin = row.original;
			return (
				<div className="flex justify-end">
					<StaffRowActions
						label={admin.name}
						isActive={admin.isActive}
						busy={handlers.busyId === admin.id}
						onEdit={() => handlers.onEdit(admin)}
						onToggleActive={() => handlers.onToggleActive(admin)}
						onDelete={() => handlers.onDelete(admin)}
					/>
				</div>
			);
		},
	},
];
