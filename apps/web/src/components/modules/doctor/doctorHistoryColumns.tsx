import { DataTableColumnHeader } from "@/components/shared/data-table/DataTableColumnHeader";
import type { DataTableFeatures } from "@/components/shared/data-table/dataTableFeatures";
import { StatusPill } from "@/components/shared/StatusPill";
import { Button } from "@/components/ui/button";
import { APPOINTMENT_STATUS_META } from "@/lib/appointmentDisplay";
import { clinicToday, formatClinicTime, formatDayLabel } from "@/lib/clinicDate";
import type { Appointment } from "@/types/appointment.types";
import type { ColumnDef } from "@tanstack/react-table";
import { Printer } from "lucide-react";
import Link from "next/link";
import { AllergyBadge } from "./AllergyBadge";

export const DOCTOR_HISTORY_MOBILE_COLUMNS = ["startAt", "patient", "actions"] as const;

const consultationHref = (id: string) => `/doctor/appointments/${id}`;

const formatClinicDay = (iso: string) => formatDayLabel(clinicToday(new Date(iso)));

function HistoryStatusPill({ appointment }: { appointment: Appointment }) {
	const meta = APPOINTMENT_STATUS_META[appointment.status];
	return <StatusPill tone={meta.tone}>{meta.label}</StatusPill>;
}

export const doctorHistoryColumns: ColumnDef<DataTableFeatures, Appointment>[] = [
	{
		accessorKey: "startAt",
		enableSorting: true,
		header: ({ column }) => <DataTableColumnHeader column={column} title="Date & time" />,
		cell: ({ row }) => (
			<div className="space-y-0.5 whitespace-nowrap">
				<time dateTime={row.original.startAt} className="block font-medium text-foreground">
					{formatClinicDay(row.original.startAt)}
				</time>
				<span className="block text-sm text-body tabular-nums">{formatClinicTime(row.original.startAt)}</span>
				<span className="font-mono text-xs text-muted-foreground">{row.original.appointmentNumber}</span>
			</div>
		),
	},
	{
		id: "patient",
		header: "Patient",
		cell: ({ row }) => {
			const { patient } = row.original;
			return (
				<div className="min-w-0 space-y-1">
					<p className="font-medium text-foreground">{patient.fullName}</p>
					<p className="truncate text-xs text-muted-foreground tabular-nums">{patient.phone ?? patient.user.email}</p>
					<div className="flex flex-wrap items-center gap-2">
						<AllergyBadge allergies={patient.allergies} />
						<span className="md:hidden">
							<HistoryStatusPill appointment={row.original} />
						</span>
					</div>
				</div>
			);
		},
	},
	{
		id: "diagnosis",
		header: "Diagnosis",
		cell: ({ row }) => {
			const diagnosis = row.original.prescription?.diagnosis;
			if (!diagnosis) return <span className="text-muted-foreground">—</span>;
			return (
				<p className="max-w-64 truncate text-sm text-body" title={diagnosis}>
					{diagnosis}
				</p>
			);
		},
	},
	{
		id: "status",
		header: "Status",
		cell: ({ row }) => <HistoryStatusPill appointment={row.original} />,
	},
	{
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: ({ row }) => {
			const appointment = row.original;
			const name = appointment.patient.fullName;
			return (
				<div className="flex justify-end gap-1">
					{appointment.prescription && (
						<Button
							size="sm"
							variant="ghost"
							render={<Link href={`${consultationHref(appointment.id)}/print`} />}
							nativeButton={false}
							aria-label={`Print prescription for ${name}`}
						>
							<Printer aria-hidden="true" />
							<span className="hidden lg:inline">Print</span>
						</Button>
					)}
					<Button
						size="sm"
						variant="outline"
						render={<Link href={consultationHref(appointment.id)} />}
						nativeButton={false}
						aria-label={`View consultation for ${name}`}
					>
						View
					</Button>
				</div>
			);
		},
	},
];
