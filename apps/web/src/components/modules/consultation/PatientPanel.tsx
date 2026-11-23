import { formatClinicTime } from "@/lib/clinicDate";
import { formatDate, pluralize } from "@/lib/format";
import { BLOOD_GROUP_LABEL, GENDER_LABEL, ageFromDateOfBirth, formatDateOfBirth } from "@/lib/patientDisplay";
import type { Appointment } from "@/types/appointment.types";
import { ChevronRight, TriangleAlert } from "lucide-react";
import Link from "next/link";

interface PatientPanelProps {
	appointment: Appointment;
	history: Appointment[]; // এই রোগীর আগের COMPLETED appointment (নতুন আগে), সর্বোচ্চ ৫টা
	historyTotal: number; // মোট কতগুলো আগের visit (এই appointment বাদে) → বেশি হলে "View all"
	today: string; // clinicToday() → বয়স হিসাব; server থেকে আসে, browser-এর ঘড়ি থেকে না
}

export function PatientPanel({ appointment, history, historyTotal, today }: PatientPanelProps) {
	const { patient } = appointment;

	return (
		<aside aria-label="Patient details" className="space-y-4">
			{patient.allergies && (
				<div className="flex gap-2 rounded-xl bg-danger-soft p-4 text-sm text-danger-foreground">
					<TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
					<p>
						<span className="font-semibold">Allergy:</span> {patient.allergies}
					</p>
				</div>
			)}

			<section aria-labelledby="patient-heading" className="space-y-3 rounded-xl border border-border bg-card p-4">
				<h2 id="patient-heading" className="font-heading text-base font-semibold text-foreground">
					Patient
				</h2>
				<dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
					<dt className="text-muted-foreground">Age</dt>
					<dd className="text-foreground">
						{patient.dateOfBirth ? (
							<>
								{ageFromDateOfBirth(patient.dateOfBirth, today)} y{" "}
								<span className="text-muted-foreground">· {formatDateOfBirth(patient.dateOfBirth)}</span>
							</>
						) : (
							"—"
						)}
					</dd>
					<dt className="text-muted-foreground">Gender</dt>
					<dd className="text-foreground">{patient.gender ? GENDER_LABEL[patient.gender] : "—"}</dd>
					<dt className="text-muted-foreground">Blood</dt>
					<dd className="text-foreground">{patient.bloodGroup ? BLOOD_GROUP_LABEL[patient.bloodGroup] : "—"}</dd>
					<dt className="text-muted-foreground">Phone</dt>
					<dd className="text-foreground">{patient.phone ?? "—"}</dd>
					<dt className="text-muted-foreground">Email</dt>
					<dd className="truncate text-foreground">{patient.user.email}</dd>
					{appointment.checkedInAt && (
						<>
							<dt className="text-muted-foreground">Arrived</dt>
							<dd className="text-foreground">{formatClinicTime(appointment.checkedInAt)}</dd>
						</>
					)}
					{appointment.reason && (
						<>
							<dt className="text-muted-foreground">Reason</dt>
							<dd className="text-foreground">{appointment.reason}</dd>
						</>
					)}
				</dl>
			</section>

			<section aria-labelledby="history-heading" className="rounded-xl border border-border bg-card">
				<h2
					id="history-heading"
					className="border-b border-border px-4 py-3 font-heading text-base font-semibold text-foreground"
				>
					Previous visits
				</h2>
				{history.length === 0 ? (
					<p className="px-4 py-6 text-center text-sm text-muted-foreground">First visit with you.</p>
				) : (
					<>
						<ul className="divide-y divide-border">
							{history.map((visit) => (
								<li key={visit.id}>
									<Link
										href={`/doctor/appointments/${visit.id}`}
										className="group flex items-center gap-2 px-4 py-3 text-sm outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
									>
										<div className="min-w-0 flex-1 space-y-1">
											<p className="text-xs text-muted-foreground">
												{formatDate(visit.startAt)} · {visit.appointmentNumber}
											</p>
											<p className="truncate font-medium text-foreground">
												{visit.prescription?.diagnosis ?? "No diagnosis recorded"}
											</p>
											{visit.prescription && visit.prescription.items.length > 0 && (
												<p className="truncate text-xs text-muted-foreground">
													{pluralize(visit.prescription.items.length, "medicine")}:{" "}
													{visit.prescription.items.map((item) => item.medicineName).join(", ")}
												</p>
											)}
										</div>
										<ChevronRight
											className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
											aria-hidden="true"
										/>
									</Link>
								</li>
							))}
						</ul>
						{historyTotal > history.length && (
							<Link
								href={`/doctor/appointments?patientId=${patient.id}`}
								className="block border-t border-border px-4 py-3 text-center text-sm font-medium text-primary outline-none hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
							>
								View all {historyTotal} visits
							</Link>
						)}
					</>
				)}
			</section>
		</aside>
	);
}
