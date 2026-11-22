"use client";

import { bookForPatientAction } from "@/actions/appointment.action";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { PAYMENT_METHOD_LABEL } from "@/lib/appointmentDisplay";
import { formatClinicTime, formatDayLabel } from "@/lib/clinicDate";
import { BOOK_PATH, type BookableSlot } from "@/lib/deskBooking";
import { formatCents } from "@/lib/format";
import type { PaymentMethod } from "@/types/appointment.types";
import { PAYMENT_METHODS } from "@/zod/appointment.validation";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

type Mode = "AT_DESK" | "ONLINE";

const MODE_OPTIONS: { value: Mode; label: string; hint: string }[] = [
	{ value: "AT_DESK", label: "Pay at desk now", hint: "Collect the fee here" },
	{ value: "ONLINE", label: "Send payment link", hint: "Patient pays online within 30 min" },
];

interface PaymentStepProps {
	patientId: string;
	patientName: string;
	doctorName: string;
	feeCents: number;
	date: string;
	slot: BookableSlot;
}

export function PaymentStep({ patientId, patientName, doctorName, feeCents, date, slot }: PaymentStepProps) {
	const router = useRouter();
	const [mode, setMode] = useState<Mode>("AT_DESK");
	const [method, setMethod] = useState<PaymentMethod>("CASH");
	const [checkInNow, setCheckInNow] = useState(slot.checkInOpen);
	const [reason, setReason] = useState("");
	const [isPending, startTransition] = useTransition();

	const atDesk = mode === "AT_DESK";
	const willCheckIn = atDesk && checkInNow && slot.checkInOpen;

	const handleConfirm = () => {
		startTransition(async () => {
			const result = await bookForPatientAction({
				patientId,
				slotId: slot.id,
				paymentMode: mode,
				deskPaymentMethod: atDesk ? method : undefined,
				checkInNow: willCheckIn || undefined,
				reason: reason.trim() || undefined,
			});

			if (!result.success) {
				toast.error(result.message);
				// slot অন্য কেউ নিয়ে থাকলে নতুন তালিকা আনি → ওই chip চলে যায়
				router.refresh();
				return;
			}
			toast.success(result.message);
			router.replace(`${BOOK_PATH}?booked=${result.data.appointmentId}`);
		});
	};

	return (
		<section className="space-y-5 rounded-xl border border-border bg-card p-4 shadow-card md:p-5">
			<div className="flex flex-wrap items-baseline justify-between gap-2">
				<h2 className="font-heading text-base font-semibold text-foreground">3. Payment</h2>
				<p className="text-sm text-muted-foreground">
					{patientName} · {doctorName} · {formatDayLabel(date)} {formatClinicTime(slot.startAt)}
				</p>
			</div>

			<p className="text-center font-heading text-3xl font-bold text-foreground tabular-nums">
				{formatCents(feeCents)}
			</p>

			<div role="group" aria-label="Payment" className="grid gap-2 sm:grid-cols-2">
				{MODE_OPTIONS.map((option) => (
					<Button
						key={option.value}
						type="button"
						variant={mode === option.value ? "default" : "outline"}
						aria-pressed={mode === option.value}
						disabled={isPending}
						className="h-auto flex-col items-start py-2.5 text-left"
						onClick={() => setMode(option.value)}
					>
						<span>{option.label}</span>
						<span className="text-xs font-normal opacity-80">{option.hint}</span>
					</Button>
				))}
			</div>

			{atDesk && (
				<div className="space-y-3">
					<div role="group" aria-label="Paid by" className="grid grid-cols-3 gap-2">
						{PAYMENT_METHODS.map((option) => (
							<Button
								key={option}
								type="button"
								size="sm"
								variant={method === option ? "default" : "outline"}
								aria-pressed={method === option}
								disabled={isPending}
								onClick={() => setMethod(option)}
							>
								{PAYMENT_METHOD_LABEL[option]}
							</Button>
						))}
					</div>

					<label className="flex cursor-pointer items-center gap-2.5 text-sm text-body">
						<Checkbox
							checked={willCheckIn}
							onCheckedChange={(checked) => setCheckInNow(checked === true)}
							disabled={isPending || !slot.checkInOpen}
						/>
						Check in now
						{!slot.checkInOpen && (
							<span className="text-xs text-muted-foreground">(opens 2 hours before the slot)</span>
						)}
					</label>
				</div>
			)}

			<div className="space-y-1.5">
				<label htmlFor="booking-reason" className="text-[13px] font-medium text-foreground">
					Reason <span className="font-normal text-muted-foreground">(optional)</span>
				</label>
				<Textarea
					id="booking-reason"
					rows={2}
					maxLength={500}
					placeholder="e.g. Fever for 3 days"
					value={reason}
					disabled={isPending}
					onChange={(event) => setReason(event.target.value)}
				/>
			</div>

			<div className="flex justify-end border-t border-border pt-4">
				<Button onClick={handleConfirm} disabled={isPending} className="min-w-44">
					{isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
					{!atDesk ? "Book & email link" : willCheckIn ? "Book, collect & check in" : "Book & collect fee"}
				</Button>
			</div>
		</section>
	);
}
