import {
	PrescriptionSheet,
	formatFollowUp,
	formatVisitDate,
} from "@/components/modules/prescription/PrescriptionSheet";
import { PrintButton } from "@/components/modules/prescription/PrintButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusPill } from "@/components/shared/StatusPill";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/types/appointment.types";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

interface PrescriptionPrintViewProps {
	appointment: Appointment;
	today: string;
	backHref: string;
	backLabel: string;
}

export function PrescriptionPrintView({ appointment, today, backHref, backLabel }: PrescriptionPrintViewProps) {
	const { prescription } = appointment;
	const isFinal = appointment.status === "COMPLETED";

	return (
		<div className="space-y-6">
			{/* screen-only toolbar */}
			<div className="space-y-2 print:hidden">
				<Button variant="ghost" size="sm" render={<Link href={backHref} />} nativeButton={false} className="-ml-2">
					<ArrowLeft aria-hidden="true" />
					{backLabel}
				</Button>
				<PageHeader
					title={`Rx · ${appointment.appointmentNumber}`}
					actions={
						prescription && (
							<>
								<StatusPill tone={isFinal ? "success" : "warning"}>{isFinal ? "Final" : "Draft"}</StatusPill>
								<PrintButton />
							</>
						)
					}
				/>
			</div>

			{!prescription ? (
				<div className="rounded-xl border border-border bg-card">
					<EmptyState
						icon={FileText}
						title="No prescription yet"
						description="The prescription appears here after the doctor saves it."
					/>
				</div>
			) : (
				<div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
					<div className="rounded-xl bg-slate-200/70 p-3 sm:p-6 print:rounded-none print:bg-transparent print:p-0">
						<PrescriptionSheet appointment={appointment} prescription={prescription} today={today} />
					</div>

					<aside
						aria-label="About this prescription"
						className="rounded-xl border border-border bg-card p-5 shadow-card print:hidden"
					>
						<h2 className="font-heading text-[15px] font-bold text-foreground">About this prescription</h2>
						<dl className="mt-3 space-y-2.5 text-[13px]">
							<Row term="Doctor" value={appointment.doctor.user.name} />
							<Row term="Visit" value={formatVisitDate(appointment.startAt)} />
							<Row term="Medicines" value={String(prescription.items.length)} />
							<Row
								term="Follow-up"
								value={prescription.followUpDate ? formatFollowUp(prescription.followUpDate) : "—"}
							/>
						</dl>
						<p className="mt-4 rounded-lg bg-primary-soft px-3 py-2.5 text-xs text-primary">
							Tip: choose “Save as PDF” in the print dialog to keep a copy.
						</p>
					</aside>
				</div>
			)}
		</div>
	);
}

function Row({ term, value }: { term: string; value: string }) {
	return (
		<div className="flex justify-between gap-4">
			<dt className="text-muted-foreground">{term}</dt>
			<dd className="text-right text-foreground">{value}</dd>
		</div>
	);
}
