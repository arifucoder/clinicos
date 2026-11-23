import { Button } from "@/components/ui/button";
import { formatDate, pluralize } from "@/lib/format";
import type { Appointment } from "@/types/appointment.types";
import { Eye, Printer } from "lucide-react";
import Link from "next/link";

export function LatestPrescriptionCard({ visit }: { visit: Appointment }) {
	const prescription = visit.prescription;
	if (!prescription) return null;
	const href = `/portal/appointments/${visit.id}/print`;

	return (
		<section
			aria-labelledby="rx-heading"
			className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-card"
		>
			<div className="flex items-center justify-between gap-3">
				<h2 id="rx-heading" className="font-heading text-base font-semibold text-foreground">
					Latest prescription
				</h2>
				<span className="text-xs text-muted-foreground">{formatDate(visit.startAt)}</span>
			</div>

			<div className="flex items-start gap-3">
				<span
					aria-hidden="true"
					className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft font-heading text-sm font-bold text-primary"
				>
					Rx
				</span>
				<div className="min-w-0">
					<p className="truncate font-medium text-foreground">{prescription.diagnosis ?? "No diagnosis recorded"}</p>
					<p className="truncate text-xs text-muted-foreground">
						{visit.doctor.user.name} · {pluralize(prescription.items.length, "medicine")}
					</p>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-2">
				<Button variant="outline" render={<Link href={href} />} nativeButton={false}>
					<Eye aria-hidden="true" />
					View
				</Button>
				<Button variant="secondary" render={<Link href={href} />} nativeButton={false}>
					<Printer aria-hidden="true" />
					Print / PDF
				</Button>
			</div>
		</section>
	);
}
