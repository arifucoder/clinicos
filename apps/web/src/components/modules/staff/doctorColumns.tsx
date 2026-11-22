import { DataTableColumnHeader } from "@/components/shared/data-table/DataTableColumnHeader";
import type { DataTableFeatures } from "@/components/shared/data-table/dataTableFeatures";
import { Badge } from "@/components/ui/badge";
import { formatCents } from "@/lib/format";
import type { StaffDoctor } from "@/types/doctor.types";
import type { ColumnDef } from "@tanstack/react-table";
import { StaffRowActions, type StaffRowHandlers } from "./StaffRowActions";
import { StaffStatus } from "./StaffStatus";

// column id = api-র sortBy নাম। mobile-এ শুধু doctor আর ⋮
export const DOCTOR_MOBILE_COLUMNS = ["user.name", "actions"] as const;

const doctorStatus = (doctor: StaffDoctor) => (
	<StaffStatus
		isActive={doctor.user.isActive}
		needPasswordChange={doctor.user.needPasswordChange}
		isPaused={doctor.isPaused}
	/>
);

export const getDoctorColumns = (
	handlers: StaffRowHandlers<StaffDoctor>,
): ColumnDef<DataTableFeatures, StaffDoctor>[] => [
	{
		// nested field: accessorKey না দিয়ে id + accessorFn, যাতে id হুবহু "user.name" থাকে (sortBy)
		id: "user.name",
		accessorFn: (doctor) => doctor.user.name,
		enableSorting: true,
		header: ({ column }) => <DataTableColumnHeader column={column} title="Doctor" />,
		cell: ({ row }) => {
			const doctor = row.original;
			return (
				<div className="min-w-0 space-y-1">
					<p className="font-medium text-foreground">{doctor.user.name}</p>
					<p className="truncate text-xs text-muted-foreground">{doctor.user.email}</p>
					{/* mobile: লুকানো column-গুলোর মূল তথ্য এখানে */}
					<div className="space-y-1.5 md:hidden">
						<p className="text-xs text-body">
							{doctor.specialties.map((specialty) => specialty.name).join(", ")} ·{" "}
							<span className="tabular-nums">{formatCents(doctor.consultationFeeCents)}</span>
						</p>
						{doctorStatus(doctor)}
					</div>
				</div>
			);
		},
	},
	{
		id: "specialties",
		header: "Specialties",
		cell: ({ row }) => (
			<div className="flex max-w-60 flex-wrap gap-1">
				{row.original.specialties.map((specialty) => (
					<Badge key={specialty.id} variant="secondary">
						{specialty.name}
					</Badge>
				))}
			</div>
		),
	},
	{
		accessorKey: "licenseNumber",
		header: "License",
		cell: ({ row }) => <span className="font-mono text-xs text-body">{row.original.licenseNumber}</span>,
	},
	{
		accessorKey: "consultationFeeCents",
		enableSorting: true,
		header: ({ column }) => <DataTableColumnHeader column={column} title="Fee" />,
		cell: ({ row }) => (
			<span className="text-sm text-body tabular-nums">{formatCents(row.original.consultationFeeCents)}</span>
		),
	},
	{
		accessorKey: "roomNumber",
		header: "Room",
		cell: ({ row }) => row.original.roomNumber ?? <span className="text-muted-foreground">—</span>,
	},
	{
		id: "status",
		header: "Status",
		cell: ({ row }) => doctorStatus(row.original),
	},
	{
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: ({ row }) => {
			const doctor = row.original;
			return (
				<div className="flex justify-end">
					<StaffRowActions
						label={doctor.user.name}
						isActive={doctor.user.isActive}
						busy={handlers.busyId === doctor.id}
						onEdit={() => handlers.onEdit(doctor)}
						onToggleActive={() => handlers.onToggleActive(doctor)}
						onDelete={() => handlers.onDelete(doctor)}
					/>
				</div>
			);
		},
	},
];
