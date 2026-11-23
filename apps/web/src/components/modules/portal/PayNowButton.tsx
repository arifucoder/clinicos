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

// Stripe Checkout-এ পাঠায়। ফেরত আসে /portal/appointments?payment=… (api-র success_url)
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
					// Stripe-এর page load হওয়া পর্যন্ত button বন্ধ থাকুক → দুবার click হয় না
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
