"use client";

import { cancelAppointmentAction } from "@/actions/appointment.action";
import { FieldShell } from "@/components/shared/form/FieldShell";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatClinicTime, formatDayLabel } from "@/lib/clinicDate";
import { CLINIC_TIME_ZONE } from "@/lib/format";
import type { Appointment } from "@/types/appointment.types";
import { cancelAppointmentSchema } from "@/zod/appointment.validation";
import { Loader2 } from "lucide-react";
import { type FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";

interface CancelAppointmentDialogProps {
	appointment: Appointment | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const clinicDate = (iso: string) =>
	new Intl.DateTimeFormat("en-CA", { timeZone: CLINIC_TIME_ZONE }).format(new Date(iso));

export function CancelAppointmentDialog({ appointment, open, onOpenChange }: CancelAppointmentDialogProps) {
	const [reason, setReason] = useState("");
	const [error, setError] = useState<string>();
	const [isPending, startTransition] = useTransition();

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!appointment) return;

		// api-র একই নিয়ম আগে browser-এ → ভুল হলে request-ই যায় না
		const parsed = cancelAppointmentSchema.safeParse({ reason });
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message);
			return;
		}

		startTransition(async () => {
			const result = await cancelAppointmentAction(appointment.id, parsed.data);
			if (!result.success) {
				setError(result.fieldErrors?.reason);
				toast.error(result.message);
				return;
			}
			toast.success(`${appointment.appointmentNumber} cancelled · ${appointment.patient.fullName} gets an email`);
			onOpenChange(false);
		});
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => !isPending && onOpenChange(next)}
			onOpenChangeComplete={(isOpen) => {
				if (isOpen) return;
				setReason("");
				setError(undefined);
			}}
		>
			<DialogContent className="sm:max-w-md">
				<form onSubmit={handleSubmit} className="space-y-4">
					<DialogHeader>
						<DialogTitle>Cancel appointment?</DialogTitle>
						<DialogDescription>
							{appointment &&
								`${appointment.patient.fullName} · ${appointment.doctor.user.name} · ${formatDayLabel(clinicDate(appointment.startAt))}, ${formatClinicTime(appointment.startAt)}`}
						</DialogDescription>
					</DialogHeader>

					{appointment?.isPaid && (
						<p className="rounded-md bg-warning-soft px-3 py-2 text-sm text-warning-foreground">
							The fee is paid. Online payments are refunded through Stripe; for desk payments, return the money at the
							desk.
						</p>
					)}

					<FieldShell id="cancel-reason" label="Reason" error={error} hint="The patient sees this in the email.">
						<Textarea
							id="cancel-reason"
							value={reason}
							onChange={(event) => {
								setReason(event.target.value);
								if (error) setError(undefined);
							}}
							maxLength={200}
							disabled={isPending}
							aria-invalid={!!error}
							aria-describedby="cancel-reason-message"
							placeholder="e.g. Doctor is on emergency duty"
						/>
					</FieldShell>

					<DialogFooter>
						<DialogClose render={<Button type="button" variant="outline" disabled={isPending} />}>
							Keep appointment
						</DialogClose>
						<Button type="submit" variant="destructive" disabled={isPending} className="min-w-36">
							{isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
							Cancel appointment
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
