import { Button } from "@/components/ui/button";
import { paidLabel } from "@/lib/appointmentDisplay";
import { clinicToday, formatClinicTime, formatDayLabel } from "@/lib/clinicDate";
import { BOOK_PATH } from "@/lib/deskBooking";
import type { Appointment, AppointmentStatus } from "@/types/appointment.types";
import { CalendarPlus, CircleCheck } from "lucide-react";
import Link from "next/link";

const STATUS_TEXT: Partial<Record<AppointmentStatus, string>> = {
	PENDING_PAYMENT: "Waiting for online payment (link emailed, 30 min)",
	CONFIRMED: "Confirmed",
	CHECKED_IN: "Checked in — in the doctor's list",
};

export function BookingDone({ appointment }: { appointment: Appointment }) {
	const day = formatDayLabel(clinicToday(new Date(appointment.startAt)));

	return (
		<section className="max-w-xl space-y-5 rounded-xl border border-border bg-card p-5 shadow-card md:p-6">
			<div className="flex items-start gap-3">
				<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
					<CircleCheck className="size-5" aria-hidden="true" />
				</span>
				<div>
					<h2 className="font-heading text-lg font-semibold text-foreground">{appointment.appointmentNumber}</h2>
					<p className="text-sm text-muted-foreground">{STATUS_TEXT[appointment.status] ?? appointment.status}</p>
				</div>
			</div>

			<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
				<dt className="text-muted-foreground">Patient</dt>
				<dd className="text-foreground">{appointment.patient.fullName}</dd>
				<dt className="text-muted-foreground">Doctor</dt>
				<dd className="text-foreground">
					{appointment.doctor.user.name}
					{appointment.doctor.roomNumber && ` · Room ${appointment.doctor.roomNumber}`}
				</dd>
				<dt className="text-muted-foreground">Time</dt>
				<dd className="text-foreground tabular-nums">
					{day} · {formatClinicTime(appointment.startAt)}–{formatClinicTime(appointment.endAt)}
				</dd>
				<dt className="text-muted-foreground">Fee</dt>
				<dd className="text-foreground">{paidLabel(appointment) ?? "Not paid yet"}</dd>
			</dl>

			<div className="flex flex-wrap gap-2 border-t border-border pt-5">
				<Button render={<Link href={BOOK_PATH} />} nativeButton={false}>
					<CalendarPlus aria-hidden="true" />
					Book another
				</Button>
				<Button variant="outline" render={<Link href="/admin/front-desk/check-in" />} nativeButton={false}>
					Go to check-in
				</Button>
			</div>
		</section>
	);
}
