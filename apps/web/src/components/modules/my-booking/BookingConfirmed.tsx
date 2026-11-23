"use client";

import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/format";
import { cancelDeadline, formatSlotLabel, MY_APPOINTMENTS_PATH } from "@/lib/myBooking";
import type { MyBookedAppointment } from "@/types/appointment.types";
import type { PublicDoctor } from "@/types/doctor.types";
import { CircleCheck, Copy } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const BRING = [
	"Photo ID (NID or passport)",
	"Previous prescriptions and test reports",
	"A list of medicines you take now",
];

export function BookingConfirmed({ appointment, doctor }: { appointment: MyBookedAppointment; doctor: PublicDoctor }) {
	const fee = formatCents(appointment.feeCents);

	const copyNumber = async () => {
		try {
			await navigator.clipboard.writeText(appointment.appointmentNumber);
			toast.success("Appointment number copied");
		} catch {
			toast.error("Couldn't copy — please note it down");
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
			<div className="flex flex-col items-center gap-3 text-center" role="status">
				<span className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
					<CircleCheck className="size-7" aria-hidden="true" />
				</span>
				<h1 className="font-heading text-[28px] font-bold tracking-tight text-foreground md:text-4xl">
					You&apos;re booked!
				</h1>
				<p className="text-[15px] text-body">
					We&apos;ve emailed the details to <b className="font-semibold text-foreground">{appointment.email}</b>.
				</p>
				<div className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pr-1 pl-4 shadow-card">
					<span className="text-[13px] text-muted-foreground">Appointment no.</span>
					<b className="font-heading text-[15px] font-bold text-foreground tabular-nums">
						{appointment.appointmentNumber}
					</b>
					<Button variant="ghost" size="icon-sm" aria-label="Copy appointment number" onClick={copyNumber}>
						<Copy />
					</Button>
				</div>
			</div>

			<div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_340px] md:gap-5">
				<section className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 shadow-card md:p-6">
					<div className="flex items-center justify-between gap-3">
						<div className="flex min-w-0 flex-col">
							<b className="truncate font-heading text-base font-bold text-foreground">{doctor.name}</b>
							<span className="truncate text-[13px] text-body">
								{doctor.specialties.map((specialty) => specialty.name).join(", ")}
							</span>
						</div>
						<span className="shrink-0 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-semibold text-success-foreground">
							Confirmed
						</span>
					</div>

					<dl className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<dt className="text-xs text-muted-foreground">When</dt>
							<dd className="mt-0.5 font-semibold text-foreground tabular-nums">{formatSlotLabel(appointment.startAt)}</dd>
						</div>
						<div>
							<dt className="text-xs text-muted-foreground">Where</dt>
							<dd className="mt-0.5 font-semibold text-foreground">
								{doctor.roomNumber ? `Room ${doctor.roomNumber}` : "Front desk will guide you"}
							</dd>
						</div>
						<div>
							<dt className="text-xs text-muted-foreground">Payment</dt>
							<dd className="mt-0.5 font-semibold text-foreground">{fee} · pay at the clinic</dd>
						</div>
						<div>
							<dt className="text-xs text-muted-foreground">Patient</dt>
							<dd className="mt-0.5 font-semibold text-foreground">{appointment.patientName}</dd>
						</div>
					</dl>

					<div className="flex flex-col gap-2 border-t border-border pt-5 sm:flex-row">
						<Button className="h-10 font-semibold" render={<Link href={MY_APPOINTMENTS_PATH} />} nativeButton={false}>
							Go to my visits
						</Button>
						<Button variant="outline" className="h-10 font-semibold" render={<Link href="/doctors" />} nativeButton={false}>
							Book another doctor
						</Button>
					</div>
					<p className="text-[13px] text-body">
						Need to change it? Cancel free until{" "}
						<b className="font-semibold text-foreground tabular-nums">{cancelDeadline(appointment.startAt)}</b> in{" "}
						<Link href={MY_APPOINTMENTS_PATH} className="font-semibold text-primary hover:underline">
							My visits
						</Link>
						.
					</p>
				</section>

				<section aria-labelledby="bring-heading" className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-card md:p-6">
					<h2 id="bring-heading" className="font-heading text-base font-bold text-foreground">
						What to bring
					</h2>
					<ul className="flex flex-col gap-2.5 text-sm text-body">
						{[...BRING, `${fee} for the fee`].map((item) => (
							<li key={item} className="flex items-start gap-2.5">
								<span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
								{item}
							</li>
						))}
					</ul>
					<p className="rounded-lg bg-primary-soft px-3.5 py-3 text-[13px] text-foreground">
						Arrive 10 minutes early and check in at reception. You&apos;ll get your token there.
					</p>
				</section>
			</div>
		</div>
	);
}
