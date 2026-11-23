"use client";

import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/format";
import { getPortalAbilities } from "@/lib/portalAppointments";
import type { Appointment } from "@/types/appointment.types";
import Link from "next/link";
import { useState } from "react";
import { CancelMyAppointmentDialog } from "../CancelMyAppointmentDialog";
import { PayNowButton } from "../PayNowButton";

interface NextAppointmentActionsProps {
	appointment: Appointment;
	nowMs: number; // server থেকে → button দেখানো/না দেখানো hydration-এ মেলে
}

export function NextAppointmentActions({ appointment, nowMs }: NextAppointmentActionsProps) {
	const [cancelOpen, setCancelOpen] = useState(false);
	const abilities = getPortalAbilities(appointment, nowMs);

	return (
		<>
			<div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
				{abilities.canPay ? (
					<PayNowButton appointmentId={appointment.id} feeCents={appointment.feeCents} />
				) : (
					<p className="flex items-center text-sm text-muted-foreground">
						{appointment.isPaid ? `Fee paid · ${formatCents(appointment.feeCents)}` : null}
					</p>
				)}
				{abilities.canCancel && (
					<Button variant="outline" onClick={() => setCancelOpen(true)}>
						Cancel
					</Button>
				)}
				<Button variant="outline" render={<Link href="/portal/appointments" />} nativeButton={false}>
					All appointments
				</Button>
			</div>
			{abilities.mustCallDesk && !abilities.canCancel && (
				<p className="text-xs text-muted-foreground">To cancel or change this appointment, call the front desk.</p>
			)}

			<CancelMyAppointmentDialog appointment={appointment} open={cancelOpen} onOpenChange={setCancelOpen} />
		</>
	);
}
