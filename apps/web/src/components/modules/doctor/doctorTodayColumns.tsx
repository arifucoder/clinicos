import { StatusPill } from "@/components/shared/StatusPill";
import type { DataTableFeatures } from "@/components/shared/data-table/dataTableFeatures";
import { Button } from "@/components/ui/button";
import { APPOINTMENT_STATUS_META } from "@/lib/appointmentDisplay";
import { formatClinicTime } from "@/lib/clinicDate";
import type { Appointment } from "@/types/appointment.types";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { AllergyBadge } from "./AllergyBadge";

export const DOCTOR_TODAY_MOBILE_COLUMNS = ["startAt", "patient", "actions"] as const;

const consultationHref = (id: string) => `/doctor/appointments/${id}`;

// প্রতিটা অবস্থায় doctor-এর জন্য দরকারি এক লাইন
function StatusMeta({ appointment }: { appointment: Appointment }) {
	switch (appointment.status) {
		case "CHECKED_IN":
			return (
				<StatusPill tone="success">
					{appointment.checkedInAt ? `Arrived ${formatClinicTime(appointment.checkedInAt)}` : "Checked in"}
				</StatusPill>
			);
		case "CONFIRMED":
			// check-in front desk-এর কাজ → doctor শুধু অবস্থা দেখে
			return appointment.isPaid ? (
				<StatusPill tone="success">Paid · waiting for front desk</StatusPill>
			) : (
				<StatusPill tone="warning">Fee unpaid — send to front desk</StatusPill>
			);
		case "COMPLETED":
			return (
				<span className="text-xs text-muted-foreground">
					{appointment.completedAt ? `Completed ${formatClinicTime(appointment.completedAt)}` : "Completed"}
				</span>
			);
		default: {
			const meta = APPOINTMENT_STATUS_META[appointment.status];
			return <StatusPill tone={meta.tone}>{meta.label}</StatusPill>;
		}
	}
}

// sort নেই: queue-র ক্রম tab ঠিক করে (DataTable-এর defaultColumn enableSorting: false)
export const doctorTodayColumns: ColumnDef<DataTableFeatures, Appointment>[] = [
	{
		accessorKey: "startAt",
		header: "Time",
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
			const { patient } = row.original;
			return (
				<div className="min-w-0 space-y-1">
					<p className="font-medium text-foreground">{patient.fullName}</p>
					<p className="truncate text-xs text-muted-foreground tabular-nums">{patient.phone ?? patient.user.email}</p>
					<div className="flex flex-wrap items-center gap-2">
						<AllergyBadge allergies={patient.allergies} />
						{/* mobile-এ status column লুকানো → এখানে দেখাই */}
						<span className="md:hidden">
							<StatusMeta appointment={row.original} />
						</span>
					</div>
				</div>
			);
		},
	},
	{
		id: "status",
		header: "Status",
		cell: ({ row }) => <StatusMeta appointment={row.original} />,
	},
	{
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		cell: ({ row }) => {
			const appointment = row.original;
			const name = appointment.patient.fullName;

			if (appointment.status === "CHECKED_IN") {
				return (
					<div className="flex justify-end">
						<Button
							size="sm"
							render={<Link href={consultationHref(appointment.id)} />}
							nativeButton={false}
							aria-label={`Open consultation for ${name}`}
						>
							Open
						</Button>
					</div>
				);
			}

			if (appointment.status === "COMPLETED") {
				return (
					<div className="flex justify-end">
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
			}

			return null;
		},
	},
];
