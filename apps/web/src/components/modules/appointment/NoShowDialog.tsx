"use client";

import { markNoShowAction } from "@/actions/appointment.action";
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

interface NoShowDialogProps {
	appointment: Appointment | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function NoShowDialog({ appointment, open, onOpenChange }: NoShowDialogProps) {
	const [isPending, startTransition] = useTransition();

	const handleConfirm = () => {
		if (!appointment) return;
		startTransition(async () => {
			const result = await markNoShowAction(appointment.id);
			if (!result.success) {
				toast.error(result.message);
				return;
			}
			toast.success(`${appointment.patient.fullName} marked as no-show`);
			onOpenChange(false);
		});
	};

	return (
		<AlertDialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Mark {appointment?.patient.fullName} as no-show?</AlertDialogTitle>
					<AlertDialogDescription>
						{appointment && `${appointment.doctor.user.name} · ${formatClinicTime(appointment.startAt)}. `}
						This can&apos;t be undone. If they arrive later, book a new appointment.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel>
					<Button variant="destructive" onClick={handleConfirm} disabled={isPending} className="min-w-32">
						{isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
						Mark no-show
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
