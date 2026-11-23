"use client";

import { resetPatientPasswordAction } from "@/actions/patient.action";
import { TemporaryPassword } from "@/components/shared/TemporaryPassword";
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
import type { PatientRecord, ResetPasswordResult } from "@/types/patient.types";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface ResetPasswordDialogProps {
	patient: PatientRecord | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ResetPasswordDialog({ patient, open, onOpenChange }: ResetPasswordDialogProps) {
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState<ResetPasswordResult | null>(null);

	const handleReset = () => {
		if (!patient) return;
		startTransition(async () => {
			const response = await resetPatientPasswordAction(patient.id);
			if (!response.success) {
				toast.error(response.message);
				return;
			}
			setResult(response.data);
		});
	};

	return (
		<AlertDialog
			open={open}
			onOpenChange={(next) => !isPending && onOpenChange(next)}
			onOpenChangeComplete={(isOpen) => !isOpen && setResult(null)}
		>
			<AlertDialogContent>
				{result ? (
					<>
						<AlertDialogHeader>
							<AlertDialogTitle>New temporary password</AlertDialogTitle>
							<AlertDialogDescription>
								{patient?.fullName} was signed out everywhere and must change this password at the next login. It is
								shown only once.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<TemporaryPassword password={result.temporaryPassword} />
						{!result.emailSent && (
							<p
								role="alert"
								className="rounded-md border border-warning/30 bg-warning-soft px-3 py-2 text-sm text-warning-foreground"
							>
								The email could not be sent. Give this password to the patient now.
							</p>
						)}
						<AlertDialogFooter>
							<Button onClick={() => onOpenChange(false)}>Done</Button>
						</AlertDialogFooter>
					</>
				) : (
					<>
						<AlertDialogHeader>
							<AlertDialogTitle>Reset password for {patient?.fullName}?</AlertDialogTitle>
							<AlertDialogDescription>
								Their current password stops working and they are signed out on every device. We email a new temporary
								password to <strong>{patient?.user.email}</strong> and show it here once.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
							<Button onClick={handleReset} disabled={isPending} className="min-w-32">
								{isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
								Reset password
							</Button>
						</AlertDialogFooter>
					</>
				)}
			</AlertDialogContent>
		</AlertDialog>
	);
}
