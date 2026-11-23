"use client";

import { checkInAppointmentAction, collectDeskFeeAction } from "@/actions/appointment.action";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { PAYMENT_METHOD_LABEL } from "@/lib/appointmentDisplay";
import { formatClinicTime } from "@/lib/clinicDate";
import { formatCents } from "@/lib/format";
import type { Appointment, PaymentMethod } from "@/types/appointment.types";
import { PAYMENT_METHODS } from "@/zod/appointment.validation";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface CollectFeeDialogProps {
	appointment: Appointment | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CollectFeeDialog({ appointment, open, onOpenChange }: CollectFeeDialogProps) {
	const [method, setMethod] = useState<PaymentMethod>("CASH");
	const [checkInAfter, setCheckInAfter] = useState(true);
	const [isPending, startTransition] = useTransition();

	const handleConfirm = () => {
		if (!appointment) return;
		startTransition(async () => {
			const payment = await collectDeskFeeAction(appointment.id, method);
			if (!payment.success) {
				toast.error(payment.message);
				return;
			}

			if (!checkInAfter) {
				toast.success(payment.message);
				onOpenChange(false);
				return;
			}

			const checkIn = await checkInAppointmentAction(appointment.id);
			if (checkIn.success) toast.success(`Fee received · ${appointment.patient.fullName} checked in`);
			else toast.warning(`Fee received, but check-in failed: ${checkIn.message}`);
			onOpenChange(false);
		});
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => !isPending && onOpenChange(next)}
			onOpenChangeComplete={(isOpen) => {
				if (isOpen) return;
				setMethod("CASH");
				setCheckInAfter(true);
			}}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Collect consultation fee</DialogTitle>
					<DialogDescription>
						{appointment &&
							`${appointment.patient.fullName} · ${appointment.doctor.user.name} · ${formatClinicTime(appointment.startAt)}`}
					</DialogDescription>
				</DialogHeader>

				<p className="py-2 text-center font-heading text-3xl font-bold text-foreground tabular-nums">
					{appointment && formatCents(appointment.feeCents)}
				</p>

				<div className="space-y-2">
					<p id="fee-method-label" className="text-[13px] font-medium text-foreground">
						Paid by
					</p>
					<div role="group" aria-labelledby="fee-method-label" className="grid grid-cols-3 gap-2">
						{PAYMENT_METHODS.map((option) => (
							<Button
								key={option}
								type="button"
								variant={method === option ? "default" : "outline"}
								aria-pressed={method === option}
								disabled={isPending}
								onClick={() => setMethod(option)}
							>
								{PAYMENT_METHOD_LABEL[option]}
							</Button>
						))}
					</div>
				</div>

				<label className="flex cursor-pointer items-center gap-2.5 text-sm text-body">
					<Checkbox
						checked={checkInAfter}
						onCheckedChange={(checked) => setCheckInAfter(checked === true)}
						disabled={isPending}
					/>
					Check in right after payment
				</label>

				<DialogFooter>
					<DialogClose render={<Button type="button" variant="outline" disabled={isPending} />}>Cancel</DialogClose>
					<Button onClick={handleConfirm} disabled={isPending} className="min-w-36">
						{isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
						{checkInAfter ? "Receive & check in" : "Receive fee"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
