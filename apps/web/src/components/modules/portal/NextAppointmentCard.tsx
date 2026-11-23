import { StatusPill } from "@/components/shared/StatusPill";
import { Button } from "@/components/ui/button";
import { APPOINTMENT_STATUS_META } from "@/lib/appointmentDisplay";
import { clinicToday, formatClinicTime, formatDayLabel } from "@/lib/clinicDate";
import type { PatientStats } from "@/types/stats.types";
import { Clock, CreditCard, DoorOpen, Search, Stethoscope } from "lucide-react";
import Link from "next/link";
import { PayNowButton } from "./PayNowButton";

interface NextAppointmentCardProps {
	appointment: PatientStats["nextAppointment"];
	today: string; // clinicToday() → "Today" লেখা; server থেকে আসে
}

export function NextAppointmentCard({ appointment, today }: NextAppointmentCardProps) {
	if (!appointment) {
		return (
			<section
				aria-labelledby="next-heading"
				className="flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-card md:p-6"
			>
				<div className="space-y-1">
					<h2 id="next-heading" className="font-heading text-lg font-semibold text-foreground">
						No upcoming appointment
					</h2>
					<p className="text-sm text-muted-foreground">Find a doctor and pick a time that suits you.</p>
				</div>
				<Button render={<Link href="/doctors" />} nativeButton={false}>
					<Search aria-hidden="true" />
					Find a doctor
				</Button>
			</section>
		);
	}

	const day = clinicToday(new Date(appointment.startAt));
	const dayLabel = day === today ? "Today" : formatDayLabel(day);
	const status = APPOINTMENT_STATUS_META[appointment.status];
	// api নিজেই শুধু চালু hold বা CONFIRMED/CHECKED_IN দেয় → এখানে শুধু paid কিনা দেখি
	const needsPayment = !appointment.isPaid && appointment.status !== "CHECKED_IN";
	const holdUntil =
		appointment.status === "PENDING_PAYMENT" && appointment.holdExpiresAt
			? formatClinicTime(appointment.holdExpiresAt)
			: null;

	return (
		<section
			aria-labelledby="next-heading"
			className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-card md:p-6"
		>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="space-y-1">
					<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Next appointment</p>
					<h2 id="next-heading" className="font-heading text-2xl font-bold text-foreground">
						{dayLabel} · <span className="tabular-nums">{formatClinicTime(appointment.startAt)}</span>
					</h2>
					<p className="font-mono text-xs text-muted-foreground">{appointment.appointmentNumber}</p>
				</div>
				<StatusPill tone={status.tone}>{status.label}</StatusPill>
			</div>

			<dl className="grid gap-3 text-sm sm:grid-cols-3">
				<div className="flex items-center gap-2">
					<Stethoscope className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
					<dt className="sr-only">Doctor</dt>
					<dd className="text-foreground">{appointment.doctor.user.name}</dd>
				</div>
				<div className="flex items-center gap-2">
					<DoorOpen className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
					<dt className="sr-only">Room</dt>
					<dd className="text-foreground">
						{appointment.doctor.roomNumber ? `Room ${appointment.doctor.roomNumber}` : "Ask the front desk for the room"}
					</dd>
				</div>
				<div className="flex items-center gap-2">
					<CreditCard className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
					<dt className="sr-only">Payment</dt>
					<dd className={appointment.isPaid ? "text-success" : "text-warning-foreground"}>
						{appointment.isPaid ? "Fee paid" : "Fee not paid yet"}
					</dd>
				</div>
			</dl>

			{holdUntil && (
				<p className="flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning-foreground">
					<Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
					Pay by {holdUntil} to keep this time — after that the slot is released.
				</p>
			)}
			{appointment.status === "CHECKED_IN" && (
				<p className="rounded-lg bg-success-soft px-3 py-2 text-sm text-success-foreground">
					You&rsquo;re checked in. Please wait near the room — the doctor will call you.
				</p>
			)}

			<div className="flex flex-wrap gap-2">
				{needsPayment && <PayNowButton appointmentId={appointment.id} />}
				<Button variant="outline" render={<Link href="/portal/appointments" />} nativeButton={false}>
					All appointments
				</Button>
			</div>
		</section>
	);
}
