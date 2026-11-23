import { LogoMark } from "@/components/shared/Logo";
import { formatClinicTime } from "@/lib/clinicDate";
import { CLINIC_INFO } from "@/lib/clinicInfo";
import { CLINIC_TIME_ZONE, formatDate, pluralize } from "@/lib/format";
import { ageFromDateOfBirth, BLOOD_GROUP_LABEL, GENDER_LABEL } from "@/lib/patientDisplay";
import type { Appointment, AppointmentPrescription } from "@/types/appointment.types";

const visitDateFormatter = new Intl.DateTimeFormat("en-GB", {
	weekday: "short",
	day: "numeric",
	month: "short",
	year: "numeric",
	timeZone: CLINIC_TIME_ZONE,
});

const followUpFormatter = new Intl.DateTimeFormat("en-GB", {
	weekday: "short",
	day: "numeric",
	month: "short",
	year: "numeric",
	timeZone: "UTC",
});

export const formatVisitDate = (iso: string) => visitDateFormatter.format(new Date(iso));
export const formatFollowUp = (iso: string) => followUpFormatter.format(new Date(iso));

const signatureName = (name: string) => {
	const parts = name
		.replace(/^dr\.?\s*/i, "")
		.trim()
		.split(/\s+/);
	if (parts.length < 2) return parts[0] ?? name;
	return `${parts[0]!.charAt(0)}. ${parts.at(-1)}`;
};

const label = "text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase";

interface PrescriptionSheetProps {
	appointment: Appointment;
	prescription: AppointmentPrescription;
	today: string; // "YYYY-MM-DD", বয়স হিসাবের জন্য (server থেকে)
}

export function PrescriptionSheet({ appointment, prescription, today }: PrescriptionSheetProps) {
	const { patient, doctor } = appointment;
	const patientMeta = [
		patient.dateOfBirth ? `${ageFromDateOfBirth(patient.dateOfBirth, today)} yrs` : null,
		patient.gender ? GENDER_LABEL[patient.gender] : null,
		patient.bloodGroup ? BLOOD_GROUP_LABEL[patient.bloodGroup] : null,
	].filter(Boolean);
	const doctorMeta = [doctor.specialties.join(", "), doctor.roomNumber ? `Room ${doctor.roomNumber}` : null].filter(
		Boolean,
	);

	return (
		<article
			aria-label="Prescription"
			className="mx-auto w-full max-w-[760px] bg-white px-6 py-8 text-slate-900 shadow-md sm:px-14 sm:py-14 print:max-w-none print:p-0 print:shadow-none"
		>
			<header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex items-center gap-2.5">
					<LogoMark className="size-9" />
					<div>
						<p className="font-heading text-lg font-bold">{CLINIC_INFO.name}</p>
						<p className="text-xs text-slate-500">
							{CLINIC_INFO.addressLine} · {CLINIC_INFO.phone} · Open 24/7
						</p>
					</div>
				</div>
				<div className="sm:text-right">
					<p className="font-heading text-2xl font-bold tracking-[0.04em]">PRESCRIPTION</p>
					<p className="text-[13px] text-slate-700 tabular-nums">
						{formatDate(prescription.updatedAt)} · {formatClinicTime(prescription.updatedAt)}
					</p>
				</div>
			</header>

			<section className="mt-6 flex flex-col gap-2 border-t border-slate-200 pt-6 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="font-heading text-[17px] font-bold">{doctor.user.name}</p>
					{doctorMeta.length > 0 && <p className="text-[13px] text-slate-700">{doctorMeta.join(" · ")}</p>}
				</div>
				<p className="text-xs text-slate-500">
					License <span className="font-mono font-semibold text-slate-900">{doctor.licenseNumber}</span>
				</p>
			</section>

			<section className="mt-6 grid gap-5 border-y border-slate-200 py-6 sm:grid-cols-2">
				<div>
					<p className={label}>Patient</p>
					<p className="mt-1 text-sm font-bold">{patient.fullName}</p>
					{patientMeta.length > 0 && <p className="text-[13px] text-slate-700">{patientMeta.join(" · ")}</p>}
					{patient.phone && <p className="text-[13px] text-slate-700">{patient.phone}</p>}
				</div>
				<div>
					<p className={label}>Visit</p>
					<p className="mt-1 text-sm font-bold">{formatVisitDate(appointment.startAt)}</p>
					<p className="text-[13px] text-slate-700 tabular-nums">
						{formatClinicTime(appointment.startAt)} · {appointment.appointmentNumber}
					</p>
				</div>
			</section>

			{patient.allergies && (
				<div
					role="note"
					className="mt-6 rounded-lg border border-l-4 border-rose-200 border-l-rose-600 bg-rose-50 px-4 py-2.5 text-[13px] font-bold text-rose-700"
				>
					⚠ Allergy: {patient.allergies}
				</div>
			)}

			<section className="mt-6 grid gap-6 sm:grid-cols-[170px_1fr]">
				<div className="space-y-6 sm:border-r sm:border-slate-200 sm:pr-6">
					{prescription.symptoms && (
						<div>
							<p className={label}>Complaints</p>
							<p className="mt-2 text-[13px] whitespace-pre-line">{prescription.symptoms}</p>
						</div>
					)}
					<div>
						<p className={label}>Diagnosis</p>
						<p className="mt-2 text-sm font-bold whitespace-pre-line">{prescription.diagnosis ?? "—"}</p>
					</div>
				</div>

				<div>
					<p aria-hidden="true" className="font-heading text-[44px] leading-none font-extrabold text-blue-700 italic">
						R<span className="text-[26px]">x</span>
					</p>
					<h2 className="sr-only">Medicines</h2>
					{prescription.items.length === 0 ? (
						<p className="mt-4 text-[13px] text-slate-500">No medicines prescribed.</p>
					) : (
						<ol className="mt-3">
							{prescription.items.map((item, index) => {
								const details = [
									item.durationDays ? pluralize(item.durationDays, "day") : null,
									item.instructions,
								].filter(Boolean);
								return (
									<li
										key={`${index}-${item.medicineName}`}
										className="grid grid-cols-[1.5rem_1fr_auto] gap-x-3 border-b border-slate-100 py-3 break-inside-avoid"
									>
										<span className="text-[13px] font-semibold text-slate-500 tabular-nums">{index + 1}.</span>
										<div>
											<p className="text-sm">
												<span className="font-bold">{item.medicineName}</span> {item.dosage}
											</p>
											{details.length > 0 && <p className="text-xs text-slate-700">{details.join(" · ")}</p>}
										</div>
										<span className="font-mono text-sm font-semibold">{item.frequency}</span>
									</li>
								);
							})}
						</ol>
					)}
				</div>
			</section>

			{prescription.advice && (
				<section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 break-inside-avoid">
					<p className={label}>Advice</p>
					<p className="mt-2 text-[13px] whitespace-pre-line">{prescription.advice}</p>
				</section>
			)}

			{prescription.followUpDate && (
				<p className="mt-6 text-sm">
					<span className="font-bold">Follow-up:</span> {formatFollowUp(prescription.followUpDate)}
				</p>
			)}

			<footer className="mt-10 break-inside-avoid">
				<div className="ml-auto w-56 text-center">
					<p className="font-heading text-[22px] font-semibold text-blue-900 italic">
						{signatureName(doctor.user.name)}
					</p>
					<div className="h-px bg-slate-900" />
					<p className="mt-1.5 text-[13px] font-bold">{doctor.user.name}</p>
					<p className="font-mono text-[11px] text-slate-500">{doctor.licenseNumber}</p>
				</div>
				<p className="mt-6 border-t border-slate-200 pt-4 text-[11px] text-slate-500">
					This prescription is digitally generated.
				</p>
			</footer>
		</article>
	);
}
