"use client";

import { undoCheckInAction } from "@/actions/appointment.action";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { formatClinicTime } from "@/lib/clinicDate";
import type { Appointment } from "@/types/appointment.types";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

interface UndoCheckInDialogProps {
	appointment: Appointment | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function UndoCheckInDialog({ appointment, open, onOpenChange }: UndoCheckInDialogProps) {
	const [isPending, startTransition] = useTransition();

	const handleUndo = () => {
		if (!appointment) return;
		startTransition(async () => {
			const result = await undoCheckInAction(appointment.id);
			if (!result.success) {
				toast.error(result.message);
				return;
			}
			toast.success(`${appointment.patient.fullName} is back to “not arrived”`);
			onOpenChange(false);
		});
	};

	return (
		<AlertDialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Undo check-in for {appointment?.patient.fullName}?</AlertDialogTitle>
					<AlertDialogDescription>
						{appointment &&
							`They disappear from ${appointment.doctor.user.name}'s list and go back to “not arrived” for ${formatClinicTime(appointment.startAt)}. `}
						The fee stays paid. You can&apos;t undo once the doctor has started the consultation.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Keep checked in</AlertDialogCancel>
					<Button onClick={handleUndo} disabled={isPending} className="min-w-32">
						{isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
						Undo check-in
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
