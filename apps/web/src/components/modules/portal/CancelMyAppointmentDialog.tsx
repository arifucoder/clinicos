"use client";

import { cancelMyAppointmentAction } from "@/actions/appointment.action";
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
import { clinicToday, formatClinicTime, formatDayLabel } from "@/lib/clinicDate";
import type { Appointment } from "@/types/appointment.types";
import { cancelMyAppointmentSchema } from "@/zod/appointment.validation";
import { Loader2 } from "lucide-react";
import { type FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";

interface CancelMyAppointmentDialogProps {
	appointment: Appointment | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CancelMyAppointmentDialog({ appointment, open, onOpenChange }: CancelMyAppointmentDialogProps) {
	const [reason, setReason] = useState("");
	const [error, setError] = useState<string>();
	const [isPending, startTransition] = useTransition();

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!appointment) return;

		const parsed = cancelMyAppointmentSchema.safeParse({ reason });
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message);
			return;
		}

		startTransition(async () => {
			const result = await cancelMyAppointmentAction(appointment.id, parsed.data);
			if (!result.success) {
				setError(result.fieldErrors?.reason);
				toast.error(result.message);
				return;
			}
			toast.success(
				appointment.isPaid
					? `${appointment.appointmentNumber} cancelled. Your online payment will be refunded.`
					: `${appointment.appointmentNumber} cancelled.`,
			);
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
						<DialogTitle>Cancel this appointment?</DialogTitle>
						<DialogDescription>
							{appointment &&
								`${appointment.doctor.user.name} · ${formatDayLabel(clinicToday(new Date(appointment.startAt)))}, ${formatClinicTime(appointment.startAt)}`}
						</DialogDescription>
					</DialogHeader>

					{appointment?.isPaid && (
						<p className="rounded-md bg-primary-soft px-3 py-2 text-sm text-body">
							You paid online — the fee goes back to your card. Refunds can take 5–10 days to show.
						</p>
					)}

					<FieldShell id="cancel-reason" label="Reason" optional error={error} hint="Helps the clinic plan better.">
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
							placeholder="e.g. I feel better now"
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
