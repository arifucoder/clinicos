"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAppointmentAbilities, noShowOpensAt } from "@/lib/appointmentDisplay";
import { formatClinicTime } from "@/lib/clinicDate";
import type { Appointment } from "@/types/appointment.types";
import { Banknote, CalendarX, Loader2, Mail, MoreVertical, Undo2, UserCheck, UserX } from "lucide-react";

export interface AppointmentRowHandlers {
	busyId: string | null;
	nowMs: number;
	onCheckIn: (appointment: Appointment) => void;
	onCollectFee: (appointment: Appointment) => void;
	onSendPaymentLink: (appointment: Appointment) => void;
	onUndoCheckIn: (appointment: Appointment) => void;
	onMarkNoShow: (appointment: Appointment) => void;
	onCancel: (appointment: Appointment) => void;
}

export function AppointmentRowActions({
	appointment,
	busyId,
	nowMs,
	onCheckIn,
	onCollectFee,
	onSendPaymentLink,
	onUndoCheckIn,
	onMarkNoShow,
	onCancel,
}: AppointmentRowHandlers & { appointment: Appointment }) {
	const can = getAppointmentAbilities(appointment, nowMs);
	const busy = busyId === appointment.id;
	const name = appointment.patient.fullName;

	const hasTopGroup = can.canSendPaymentLink || can.canUndoCheckIn;
	const hasMenu = hasTopGroup || can.canCancel;

	// শেষ হয়ে যাওয়া appointment (completed/cancelled/…) → কোনো কাজ নেই
	if (!can.canCheckIn && !can.canCollectFee && !hasMenu) {
		return <span className="text-xs text-muted-foreground">—</span>;
	}

	return (
		<div className="flex items-center justify-end gap-2">
			{/* পরের মূল কাজটা সরাসরি button, বাকিগুলো menu-তে */}
			{can.canCheckIn && (
				<Button size="sm" onClick={() => onCheckIn(appointment)} disabled={busy} aria-label={`Check in ${name}`}>
					{busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <UserCheck aria-hidden="true" />}
					Check in
				</Button>
			)}
			{can.canCollectFee && (
				<Button
					size="sm"
					variant="outline"
					onClick={() => onCollectFee(appointment)}
					disabled={busy}
					aria-label={`Collect fee from ${name}`}
				>
					<Banknote aria-hidden="true" />
					Collect fee
				</Button>
			)}

			{hasMenu && (
				<DropdownMenu>
					<DropdownMenuTrigger
						render={<Button variant="outline" size="icon-sm" aria-label={`More actions for ${name}`} disabled={busy} />}
					>
						{busy && !can.canCheckIn ? <Loader2 className="animate-spin" /> : <MoreVertical />}
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						{can.canSendPaymentLink && (
							<DropdownMenuItem onClick={() => onSendPaymentLink(appointment)}>
								<Mail />
								Email payment link
							</DropdownMenuItem>
						)}
						{can.canUndoCheckIn && (
							<DropdownMenuItem onClick={() => onUndoCheckIn(appointment)}>
								<Undo2 />
								Undo check-in
							</DropdownMenuItem>
						)}

						{hasTopGroup && can.canCancel && <DropdownMenuSeparator />}

						{appointment.status === "CONFIRMED" && (
							<DropdownMenuItem disabled={!can.canMarkNoShow} onClick={() => onMarkNoShow(appointment)}>
								<UserX />
								{can.canMarkNoShow
									? "Mark as no-show"
									: `No-show after ${formatClinicTime(noShowOpensAt(appointment))}`}
							</DropdownMenuItem>
						)}
						{can.canCancel && (
							<DropdownMenuItem variant="destructive" onClick={() => onCancel(appointment)}>
								<CalendarX />
								Cancel appointment
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</div>
	);
}
