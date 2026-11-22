import { DataTableColumnHeader } from "@/components/shared/data-table/DataTableColumnHeader";
import type { DataTableFeatures } from "@/components/shared/data-table/dataTableFeatures";
import { StatusPill } from "@/components/shared/StatusPill";
import { formatDate } from "@/lib/format";
import type { StaffAdmin } from "@/types/admin.types";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminRowActions, type AdminRowHandlers } from "./AdminRowActions";

// mobile-এ শুধু এই দুটো column; বাকি তথ্য "name" cell-এর ভেতরে md:hidden হয়ে দেখায়
export const ADMIN_MOBILE_COLUMNS = ["name", "actions"] as const;

function AdminStatus({ admin }: { admin: StaffAdmin }) {
	return (
		<div className="flex flex-wrap gap-1.5">
			<StatusPill tone={admin.isActive ? "success" : "neutral"}>{admin.isActive ? "Active" : "Inactive"}</StatusPill>
			{/* temporary password এখনো বদলায়নি = এখনো প্রথমবার login করেনি */}
			{admin.needPasswordChange && <StatusPill tone="info">Invited</StatusPill>}
		</div>
	);
}

export const getAdminColumns = (handlers: AdminRowHandlers): ColumnDef<DataTableFeatures, StaffAdmin>[] => [
	{
		accessorKey: "name",
		enableSorting: true,
		header: ({ column }) => <DataTableColumnHeader column={column} title="Admin" />,
		cell: ({ row }) => (
			<div className="min-w-0 space-y-1">
				<p className="font-medium text-foreground">{row.original.name}</p>
				<p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
				<div className="md:hidden">
					<AdminStatus admin={row.original} />
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
		cell: ({ row }) => <AdminStatus admin={row.original} />,
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
		cell: ({ row }) => (
			<div className="flex justify-end">
				<AdminRowActions admin={row.original} {...handlers} />
			</div>
		),
	},
];
