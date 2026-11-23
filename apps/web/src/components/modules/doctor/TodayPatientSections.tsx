import { StatusPill } from "@/components/shared/StatusPill";
import { Button } from "@/components/ui/button";
import { formatClinicTime } from "@/lib/clinicDate";
import type { Appointment } from "@/types/appointment.types";
import { ChevronDown, TriangleAlert } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const consultationHref = (id: string) => `/doctor/appointments/${id}`;

function CountBadge({ count }: { count: number }) {
	return (
		<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-body tabular-nums">{count}</span>
	);
}

function AllergyBadge({ allergies }: { allergies: string | null }) {
	if (!allergies) return null;
	return (
		<span className="inline-flex max-w-full items-center gap-1 rounded-md bg-danger-soft px-1.5 py-0.5 text-xs font-medium text-danger-foreground">
			<TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />
			<span className="truncate">Allergy: {allergies}</span>
		</span>
	);
}

function EmptyRow({ children }: { children: ReactNode }) {
	return <p className="px-4 py-6 text-center text-sm text-muted-foreground">{children}</p>;
}

interface PatientRowProps {
	appointment: Appointment;
	meta: ReactNode; // নামের নিচে ছোট লেখা: "Arrived 10:22" / payment অবস্থা
	action?: ReactNode;
}

function PatientRow({ appointment, meta, action }: PatientRowProps) {
	return (
		<li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
			<span className="w-14 shrink-0 font-medium text-foreground tabular-nums">
				{formatClinicTime(appointment.startAt)}
			</span>
			<div className="min-w-0 flex-1 space-y-1">
				<p className="truncate font-medium text-foreground">
					{appointment.patient.fullName}{" "}
					<span className="text-xs font-normal text-muted-foreground">· {appointment.appointmentNumber}</span>
				</p>
				<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
					{meta}
					<AllergyBadge allergies={appointment.patient.allergies} />
				</div>
			</div>
			{action && <div className="shrink-0">{action}</div>}
		</li>
	);
}

interface SectionProps {
	appointments: Appointment[];
}

export function CheckedInSection({ appointments }: SectionProps) {
	return (
		<section aria-labelledby="checked-in-heading" className="rounded-xl border border-border bg-card">
			<header className="flex items-center gap-2 border-b border-border px-4 py-3">
				<h2 id="checked-in-heading" className="font-heading text-base font-semibold text-foreground">
					Checked in
				</h2>
				<CountBadge count={appointments.length} />
			</header>

			{appointments.length === 0 ? (
				<EmptyRow>No one is waiting right now.</EmptyRow>
			) : (
				<ul className="divide-y divide-border">
					{appointments.map((appointment) => (
						<PatientRow
							key={appointment.id}
							appointment={appointment}
							meta={appointment.checkedInAt && <span>Arrived {formatClinicTime(appointment.checkedInAt)}</span>}
							action={
								<Button
									size="sm"
									render={<Link href={consultationHref(appointment.id)} />}
									nativeButton={false}
									aria-label={`Open consultation for ${appointment.patient.fullName}`}
								>
									Open
								</Button>
							}
						/>
					))}
				</ul>
			)}
		</section>
	);
}

export function NotArrivedSection({ appointments }: SectionProps) {
	return (
		<section aria-labelledby="not-arrived-heading" className="rounded-xl border border-border bg-card">
			<header className="flex items-center gap-2 border-b border-border px-4 py-3">
				<h2 id="not-arrived-heading" className="font-heading text-base font-semibold text-foreground">
					Not arrived yet
				</h2>
				<CountBadge count={appointments.length} />
			</header>

			{appointments.length === 0 ? (
				<EmptyRow>No more confirmed appointments today.</EmptyRow>
			) : (
				<ul className="divide-y divide-border">
					{appointments.map((appointment) => (
						<PatientRow
							key={appointment.id}
							appointment={appointment}
							meta={
								appointment.isPaid ? (
									<StatusPill tone="success">Paid · waiting for front desk</StatusPill>
								) : (
									<StatusPill tone="warning">Fee unpaid — send to front desk</StatusPill>
								)
							}
						/>
					))}
				</ul>
			)}
		</section>
	);
}

export function CompletedSection({ appointments }: SectionProps) {
	return (
		<details className="group rounded-xl border border-border bg-card">
			<summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-4 py-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
				<h2 className="font-heading text-base font-semibold text-foreground">Completed today</h2>
				<CountBadge count={appointments.length} />
				<ChevronDown
					className="ml-auto size-4 text-muted-foreground transition-transform group-open:rotate-180"
					aria-hidden="true"
				/>
			</summary>

			<div className="border-t border-border">
				{appointments.length === 0 ? (
					<EmptyRow>No completed consultations yet.</EmptyRow>
				) : (
					<ul className="divide-y divide-border">
						{appointments.map((appointment) => (
							<PatientRow
								key={appointment.id}
								appointment={appointment}
								meta={appointment.completedAt && <span>Completed {formatClinicTime(appointment.completedAt)}</span>}
								action={
									<Button
										size="sm"
										variant="outline"
										render={<Link href={consultationHref(appointment.id)} />}
										nativeButton={false}
										aria-label={`View consultation for ${appointment.patient.fullName}`}
									>
										View
									</Button>
								}
							/>
						))}
					</ul>
				)}
			</div>
		</details>
	);
}
