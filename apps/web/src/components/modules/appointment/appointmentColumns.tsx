import { DataTableColumnHeader } from "@/components/shared/data-table/DataTableColumnHeader";
import type { DataTableFeatures } from "@/components/shared/data-table/dataTableFeatures";
import { StatusPill } from "@/components/shared/StatusPill";
import { APPOINTMENT_STATUS_META, SOURCE_LABEL, paidLabel } from "@/lib/appointmentDisplay";
import { formatClinicTime } from "@/lib/clinicDate";
import { formatCents } from "@/lib/format";
import type { Appointment } from "@/types/appointment.types";
import type { ColumnDef } from "@tanstack/react-table";
import { AppointmentRowActions, type AppointmentRowHandlers } from "./AppointmentRowActions";

export const APPOINTMENT_MOBILE_COLUMNS = ["startAt", "patient", "actions"] as const;

function AppointmentStatusPill({ appointment }: { appointment: Appointment }) {
	const meta = APPOINTMENT_STATUS_META[appointment.status];
	const label =
		appointment.status === "CHECKED_IN" && appointment.checkedInAt
			? `${meta.label} · ${formatClinicTime(appointment.checkedInAt)}`
			: meta.label;
	return <StatusPill tone={meta.tone}>{label}</StatusPill>;
}

export const getAppointmentColumns = (
	handlers: AppointmentRowHandlers,
): ColumnDef<DataTableFeatures, Appointment>[] => [
	{
		accessorKey: "startAt",
		enableSorting: true,
		header: ({ column }) => <DataTableColumnHeader column={column} title="Time" />,
		cell: ({ row }) => (
			<div className="space-y-0.5 whitespace-nowrap">
				<time
					dateTime={row.original.startAt}
					className="block font-heading text-base font-semibold text-foreground tabular-nums"
				>
					{formatClinicTime(row.original.startAt)}
				</time>
				<span className="font-mono text-xs text-muted-foreground">{row.original.appointmentNumber}</span>
			</div>
		),
	},
	{
		id: "patient",
		header: "Patient",
		cell: ({ row }) => {
			const { patient, doctor } = row.original;
			return (
				<div className="min-w-0 space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<p className="font-medium text-foreground">{patient.fullName}</p>
						{patient.allergies && (
							<span title={patient.allergies}>
								<StatusPill tone="danger">Allergy</StatusPill>
							</span>
						)}
					</div>
					<p className="truncate text-xs text-muted-foreground tabular-nums">{patient.phone ?? patient.user.email}</p>
					<div className="space-y-1 md:hidden">
						<p className="text-xs text-body">{doctor.user.name}</p>
						<AppointmentStatusPill appointment={row.original} />
					</div>
				</div>
			);
		},
	},
	{
		id: "doctor",
		header: "Doctor",
		cell: ({ row }) => {
			const { doctor } = row.original;
			return (
				<div className="text-sm whitespace-nowrap">
					<p className="text-body">{doctor.user.name}</p>
					{doctor.roomNumber && <p className="text-xs text-muted-foreground">Room {doctor.roomNumber}</p>}
				</div>
			);
		},
	},
	{
		id: "payment",
		header: "Fee",
		cell: ({ row }) => {
			const appointment = row.original;
			const paid = paidLabel(appointment);
			const isActive = appointment.status === "PENDING_PAYMENT" || appointment.status === "CONFIRMED";
			return (
				<div className="space-y-1 text-sm whitespace-nowrap">
					<p className="text-body tabular-nums">{formatCents(appointment.feeCents)}</p>
					{paid ? (
						<StatusPill tone="success">{paid}</StatusPill>
					) : isActive ? (
						<StatusPill tone="warning">
							{appointment.paymentMode === "ONLINE" ? "Unpaid · online" : "Unpaid · at desk"}
						</StatusPill>
					) : (
						<span className="text-xs text-muted-foreground">Not paid</span>
					)}
					{appointment.status === "PENDING_PAYMENT" && appointment.holdExpiresAt && (
						<p className="text-xs text-muted-foreground">Hold until {formatClinicTime(appointment.holdExpiresAt)}</p>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const appointment = row.original;
			return (
				<div className="space-y-1">
					<AppointmentStatusPill appointment={appointment} />
					<p className="text-xs text-muted-foreground">{SOURCE_LABEL[appointment.source]}</p>
					{appointment.cancelReason && (
						<p className="max-w-48 truncate text-xs text-muted-foreground" title={appointment.cancelReason}>
							{appointment.cancelReason}
						</p>
					)}
				</div>
			);
		},
	},
	{
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: ({ row }) => <AppointmentRowActions appointment={row.original} {...handlers} />,
	},
];
