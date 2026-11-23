import { AutoRefresh } from "@/components/shared/AutoRefresh";
import type { Appointment } from "@/types/appointment.types";
import { CircleCheck, Info, Loader2, X } from "lucide-react";
import Link from "next/link";

interface PaymentReturnBannerProps {
	payment: "success" | "cancelled";
	appointment: Appointment | undefined; // এই page-এ না থাকলে undefined
}

// Stripe থেকে ফেরার পর। webhook redirect-এর একটু পরে আসতে পারে → paid না হওয়া পর্যন্ত ৫ সেকেন্ডে refresh
export function PaymentReturnBanner({ payment, appointment }: PaymentReturnBannerProps) {
	const confirming = payment === "success" && appointment !== undefined && !appointment.isPaid;

	const content =
		payment === "cancelled"
			? {
					tone: "bg-warning-soft text-warning-foreground",
					icon: <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />,
					text: "Payment not completed. You can try again with Pay now while the booking is held.",
				}
			: confirming
				? {
						tone: "bg-primary-soft text-body",
						icon: <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-primary" aria-hidden="true" />,
						text: `Payment received — confirming ${appointment.appointmentNumber}. This takes a few seconds.`,
					}
				: {
						tone: "bg-success-soft text-success-foreground",
						icon: <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />,
						text: appointment
							? `Payment successful. ${appointment.appointmentNumber} is confirmed — we've emailed you the details.`
							: "Payment successful. We've emailed you the details.",
					};

	return (
		<div role="status" className={`flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${content.tone}`}>
			<AutoRefresh enabled={confirming} />
			{content.icon}
			<p className="flex-1">{content.text}</p>
			{/* query বাদ দিয়ে একই page → banner চলে যায় */}
			<Link
				href="/portal/appointments"
				aria-label="Dismiss message"
				className="-m-1 rounded p-1 opacity-70 hover:opacity-100"
			>
				<X className="size-4" aria-hidden="true" />
			</Link>
		</div>
	);
}
