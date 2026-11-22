import { formatClinicTime } from "@/lib/clinicDate";
import { formatDate, pluralize } from "@/lib/format";
import { BLOOD_GROUP_LABEL, GENDER_LABEL, ageFromDateOfBirth, formatDateOfBirth } from "@/lib/patientDisplay";
import type { Appointment } from "@/types/appointment.types";
import { TriangleAlert } from "lucide-react";

interface PatientPanelProps {
	appointment: Appointment;
	history: Appointment[]; // এই রোগীর আগের COMPLETED appointment (নতুন আগে)
	today: string; // clinicToday() → বয়স হিসাব; server থেকে আসে, browser-এর ঘড়ি থেকে না
}

// server component: শুধু দেখায়, কোনো state নেই → "use client" লাগে না
export function PatientPanel({ appointment, history, today }: PatientPanelProps) {
	const { patient } = appointment;

	return (
		<aside aria-label="Patient details" className="space-y-4">
			{/* design: rose = allergy, সবার উপরে, চোখ এড়ানো চলবে না */}
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
					<ul className="divide-y divide-border">
						{history.map((visit) => (
							<li key={visit.id} className="space-y-1 px-4 py-3 text-sm">
								<p className="text-xs text-muted-foreground">
									{formatDate(visit.startAt)} · {visit.appointmentNumber}
								</p>
								<p className="font-medium text-foreground">
									{visit.prescription?.diagnosis ?? "No diagnosis recorded"}
								</p>
								{visit.prescription && visit.prescription.items.length > 0 && (
									<p className="text-xs text-muted-foreground">
										{pluralize(visit.prescription.items.length, "medicine")}:{" "}
										{visit.prescription.items.map((item) => item.medicineName).join(", ")}
									</p>
								)}
							</li>
						))}
					</ul>
				)}
			</section>
		</aside>
	);
}
