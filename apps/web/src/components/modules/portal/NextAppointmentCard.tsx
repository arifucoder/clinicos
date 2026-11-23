import { StatusPill } from "@/components/shared/StatusPill";
import { Button } from "@/components/ui/button";
import { APPOINTMENT_STATUS_META } from "@/lib/appointmentDisplay";
import { clinicToday, formatClinicTime, formatDayLabel } from "@/lib/clinicDate";
import { tileFromInstant } from "@/lib/portalHome";
import type { Appointment } from "@/types/appointment.types";
import { CalendarPlus, Search } from "lucide-react";
import Link from "next/link";
import { DateTile } from "./home/DateTile";
import { HoldCountdown } from "./home/HoldCountdown";
import { NextAppointmentActions } from "./home/NextAppointmentActions";

interface NextAppointmentCardProps {
	appointment: Appointment | null;
	today: string; // clinicToday() → "Today" লেখা
	nowMs: number;
}

const cardClass = "rounded-xl border border-border bg-card shadow-card";

export function NextAppointmentCard({ appointment, today, nowMs }: NextAppointmentCardProps) {
	if (!appointment) {
		return (
			<section aria-labelledby="next-heading" className={`${cardClass} flex items-center gap-4 p-5 md:p-6`}>
				<span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
					<CalendarPlus className="size-5" aria-hidden="true" />
				</span>
				<div className="min-w-0 flex-1 space-y-0.5">
					<h2 id="next-heading" className="font-heading text-base font-semibold text-foreground">
						No upcoming appointment
					</h2>
					<p className="text-sm text-muted-foreground">Find a doctor and pick a time that suits you.</p>
				</div>
				<Button render={<Link href="/doctors" />} nativeButton={false} className="shrink-0">
					<Search aria-hidden="true" />
					<span className="hidden sm:inline">Find a doctor</span>
				</Button>
			</section>
		);
	}

	const day = clinicToday(new Date(appointment.startAt));
	const dayLabel = day === today ? "Today" : formatDayLabel(day);
	const status = APPOINTMENT_STATUS_META[appointment.status];
	const holdActive =
		appointment.status === "PENDING_PAYMENT" &&
		appointment.holdExpiresAt !== null &&
		new Date(appointment.holdExpiresAt).getTime() > nowMs;
	const { doctor } = appointment;
	const details = [doctor.specialties[0], doctor.roomNumber && `Room ${doctor.roomNumber}`, appointment.appointmentNumber]
		.filter(Boolean)
		.join(" · ");

	return (
		<section aria-labelledby="next-heading" className={`${cardClass} space-y-4 p-5 md:p-6`}>
			<div className="flex items-center justify-between gap-3">
				<h2 id="next-heading" className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
					Next appointment
				</h2>
				<StatusPill tone={status.tone}>{status.label}</StatusPill>
			</div>

			<div className="flex items-center gap-4">
				<DateTile parts={tileFromInstant(appointment.startAt)} />
				<div className="min-w-0 space-y-0.5">
					<p className="font-heading text-2xl font-bold text-foreground">
						{dayLabel} · <span className="tabular-nums">{formatClinicTime(appointment.startAt)}</span>
					</p>
					<p className="font-medium text-foreground">{doctor.user.name}</p>
					<p className="truncate text-sm text-muted-foreground">{details}</p>
				</div>
			</div>

			{holdActive && appointment.holdExpiresAt && (
				<HoldCountdown expiresAt={appointment.holdExpiresAt} serverNowMs={nowMs} />
			)}
			{appointment.status === "CHECKED_IN" && (
				<p className="rounded-lg bg-success-soft px-3 py-2 text-sm text-success-foreground">
					You&rsquo;re checked in. Please wait near {doctor.roomNumber ? `room ${doctor.roomNumber}` : "the room"} —
					the doctor will call you.
				</p>
			)}

			<NextAppointmentActions appointment={appointment} nowMs={nowMs} />
		</section>
	);
}
