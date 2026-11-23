import { StaffStatus } from "@/components/modules/staff/StaffStatus";
import { DataTableColumnHeader } from "@/components/shared/data-table/DataTableColumnHeader";
import type { DataTableFeatures } from "@/components/shared/data-table/dataTableFeatures";
import { StatusPill } from "@/components/shared/StatusPill";
import { formatDate } from "@/lib/format";
import { BLOOD_GROUP_LABEL, GENDER_LABEL, ageFromDateOfBirth, formatDateOfBirth } from "@/lib/patientDisplay";
import type { PatientRecord } from "@/types/patient.types";
import type { ColumnDef } from "@tanstack/react-table";
import { Droplet } from "lucide-react";
import { PatientRowActions, type PatientRowHandlers } from "./PatientRowActions";

export const PATIENT_MOBILE_COLUMNS = ["fullName", "actions"] as const;

const Dash = () => <span className="text-muted-foreground">—</span>;

export const getPatientColumns = (
	today: string,
	handlers: PatientRowHandlers,
): ColumnDef<DataTableFeatures, PatientRecord>[] => [
	{
		accessorKey: "fullName",
		enableSorting: true,
		header: ({ column }) => <DataTableColumnHeader column={column} title="Patient" />,
		cell: ({ row }) => {
			const patient = row.original;
			return (
				<div className="min-w-0 space-y-1">
					<p className="font-medium text-foreground">{patient.fullName}</p>
					<p className="truncate text-xs text-muted-foreground">{patient.user.email}</p>
					<div className="space-y-1 md:hidden">
						{patient.phone && <p className="text-xs text-body tabular-nums">{patient.phone}</p>}
						<StaffStatus isActive={patient.user.isActive} needPasswordChange={patient.user.needPasswordChange} />
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "phone",
		header: "Phone",
		cell: ({ row }) =>
			row.original.phone ? (
				<span className="text-sm whitespace-nowrap text-body tabular-nums">{row.original.phone}</span>
			) : (
				<Dash />
			),
	},
	{
		accessorKey: "dateOfBirth",
		enableSorting: true,
		header: ({ column }) => <DataTableColumnHeader column={column} title="Age / gender" />,
		cell: ({ row }) => {
			const { dateOfBirth, gender } = row.original;
			if (!dateOfBirth && !gender) return <Dash />;
			return (
				<div className="text-sm whitespace-nowrap">
					<p className="text-body">
						{dateOfBirth ? `${ageFromDateOfBirth(dateOfBirth, today)} y` : "—"}
						{gender && ` · ${GENDER_LABEL[gender]}`}
					</p>
					{dateOfBirth && <p className="text-xs text-muted-foreground">{formatDateOfBirth(dateOfBirth)}</p>}
				</div>
			);
		},
	},
	{
		accessorKey: "bloodGroup",
		header: "Blood / allergy",
		cell: ({ row }) => {
			const { bloodGroup, allergies } = row.original;
			if (!bloodGroup && !allergies) return <Dash />;
			return (
				<div className="flex flex-wrap items-center gap-1.5">
					{bloodGroup && (
						<span className="inline-flex items-center gap-1 text-sm font-medium whitespace-nowrap text-body">
							<Droplet className="size-3.5 text-danger" aria-hidden="true" />
							<span className="sr-only">Blood group </span>
							{BLOOD_GROUP_LABEL[bloodGroup]}
						</span>
					)}
					{allergies && (
						<span title={allergies}>
							<StatusPill tone="danger">Allergy</StatusPill>
						</span>
					)}
				</div>
			);
		},
	},
	{
		id: "status",
		header: "Account",
		cell: ({ row }) => (
			<StaffStatus isActive={row.original.user.isActive} needPasswordChange={row.original.user.needPasswordChange} />
		),
	},
	{
		accessorKey: "createdAt",
		enableSorting: true,
		header: ({ column }) => <DataTableColumnHeader column={column} title="Registered" />,
		cell: ({ row }) => (
			<span className="text-sm whitespace-nowrap text-body">{formatDate(row.original.createdAt)}</span>
		),
	},
	{
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: ({ row }) => (
			<div className="flex justify-end">
				<PatientRowActions patient={row.original} {...handlers} />
			</div>
		),
	},
];
