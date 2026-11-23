"use client";

import { payMyAppointmentAction } from "@/actions/appointment.action";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/format";
import { CreditCard, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface PayNowButtonProps {
	appointmentId: string;
	label?: string;
	feeCents?: number;
}

export function PayNowButton({ appointmentId, label = "Pay now", feeCents }: PayNowButtonProps) {
	const [isPending, startTransition] = useTransition();
	const [redirecting, setRedirecting] = useState(false);
	const busy = isPending || redirecting;

	return (
		<Button
			disabled={busy}
			onClick={() =>
				startTransition(async () => {
					const result = await payMyAppointmentAction(appointmentId);
					if (!result.success) {
						toast.error(result.message);
						return;
					}
					setRedirecting(true);
					window.location.assign(result.data.checkoutUrl);
				})
			}
		>
			{busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <CreditCard aria-hidden="true" />}
			{feeCents === undefined ? label : `${label} · ${formatCents(feeCents)}`}
		</Button>
	);
}
