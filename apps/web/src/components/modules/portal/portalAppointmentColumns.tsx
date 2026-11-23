import { StatusPill } from "@/components/shared/StatusPill";
import type { DataTableFeatures } from "@/components/shared/data-table/dataTableFeatures";
import { Button } from "@/components/ui/button";
import { APPOINTMENT_STATUS_META, paidLabel } from "@/lib/appointmentDisplay";
import { clinicToday, formatClinicTime, formatDayLabel } from "@/lib/clinicDate";
import { formatCents } from "@/lib/format";
import { getPortalAbilities } from "@/lib/portalAppointments";
import type { Appointment } from "@/types/appointment.types";
import type { ColumnDef } from "@tanstack/react-table";
import { CreditCard, FileText, Loader2, Phone } from "lucide-react";
import Link from "next/link";

export const PORTAL_APPOINTMENT_MOBILE_COLUMNS = ["startAt", "doctor", "actions"] as const;

export interface PortalAppointmentHandlers {
	busyId: string | null;
	nowMs: number;
	onPay: (appointment: Appointment) => void;
	onCancel: (appointment: Appointment) => void;
}

// browser-এর timezone না, clinic-এর দিন
const formatClinicDay = (iso: string) => formatDayLabel(clinicToday(new Date(iso)));

function StatusCell({ appointment }: { appointment: Appointment }) {
	const meta = APPOINTMENT_STATUS_META[appointment.status];
	const paid = paidLabel(appointment);
	return (
		<div className="space-y-1">
			<StatusPill tone={meta.tone}>{meta.label}</StatusPill>
			{appointment.status === "CANCELLED" && appointment.cancelReason && (
				<p className="max-w-56 truncate text-xs text-muted-foreground" title={appointment.cancelReason}>
					{appointment.cancelReason}
				</p>
			)}
			{paid && appointment.status !== "CANCELLED" && <p className="text-xs text-muted-foreground">{paid}</p>}
		</div>
	);
}

// sort নেই: ক্রম tab ঠিক করে (upcoming = কাছেরটা আগে, past = নতুনটা আগে)
export const getPortalAppointmentColumns = (
	handlers: PortalAppointmentHandlers,
): ColumnDef<DataTableFeatures, Appointment>[] => [
	{
		accessorKey: "startAt",
		header: "Date & time",
		cell: ({ row }) => (
			<div className="space-y-0.5 whitespace-nowrap">
				<time dateTime={row.original.startAt} className="block font-medium text-foreground">
					{formatClinicDay(row.original.startAt)}
				</time>
				<span className="block font-heading text-base font-semibold text-foreground tabular-nums">
					{formatClinicTime(row.original.startAt)}
				</span>
				<span className="font-mono text-xs text-muted-foreground">{row.original.appointmentNumber}</span>
			</div>
		),
	},
	{
		id: "doctor",
		header: "Doctor",
		cell: ({ row }) => {
			const { doctor } = row.original;
			return (
				<div className="min-w-0 space-y-1">
					<p className="font-medium text-foreground">{doctor.user.name}</p>
					{doctor.specialties.length > 0 && (
						<p className="truncate text-xs text-muted-foreground">{doctor.specialties.join(", ")}</p>
					)}
					{doctor.roomNumber && <p className="text-xs text-body">Room {doctor.roomNumber}</p>}
					{/* mobile-এ status column লুকানো → এখানে দেখাই */}
					<div className="pt-1 md:hidden">
						<StatusCell appointment={row.original} />
					</div>
				</div>
			);
		},
	},
	{
		id: "status",
		header: "Status",
		cell: ({ row }) => <StatusCell appointment={row.original} />,
	},
	{
		id: "fee",
		header: "Fee",
		cell: ({ row }) => <span className="text-sm text-body tabular-nums">{formatCents(row.original.feeCents)}</span>,
	},
	{
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: ({ row }) => {
			const appointment = row.original;
			const abilities = getPortalAbilities(appointment, handlers.nowMs);
			const isBusy = handlers.busyId === appointment.id;
			const label = `${appointment.appointmentNumber} with ${appointment.doctor.user.name}`;

			return (
				<div className="flex flex-col items-end gap-1.5 sm:flex-row sm:justify-end">
					{abilities.canPay && (
						<Button
							size="sm"
							disabled={isBusy}
							onClick={() => handlers.onPay(appointment)}
							aria-label={`Pay ${formatCents(appointment.feeCents)} for ${label}`}
						>
							{isBusy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <CreditCard aria-hidden="true" />}
							Pay now
						</Button>
					)}
					{abilities.canCancel && (
						<Button
							size="sm"
							variant="ghost"
							disabled={isBusy}
							onClick={() => handlers.onCancel(appointment)}
							className="text-destructive hover:text-destructive"
							aria-label={`Cancel ${label}`}
						>
							Cancel
						</Button>
					)}
					{abilities.mustCallDesk && !abilities.canCancel && (
						<span className="flex items-center gap-1 text-xs text-muted-foreground">
							<Phone className="size-3" aria-hidden="true" />
							To cancel, call the front desk
						</span>
					)}
					{abilities.canViewPrescription && (
						<Button
							size="sm"
							variant="outline"
							render={<Link href={`/portal/appointments/${appointment.id}/print`} />}
							nativeButton={false}
							aria-label={`View prescription for ${label}`}
						>
							<FileText aria-hidden="true" />
							Prescription
						</Button>
					)}
				</div>
			);
		},
	},
];
