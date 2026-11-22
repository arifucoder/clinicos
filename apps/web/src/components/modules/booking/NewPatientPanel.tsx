"use client";

import { PatientRegisterForm } from "@/components/modules/patient/PatientRegisterForm";
import { BOOK_PATH } from "@/lib/deskBooking";
import { useRouter } from "next/navigation";

// নতুন রোগী → temporary password card → "Continue booking" → ধাপ ২
export function NewPatientPanel() {
	const router = useRouter();
	return (
		<PatientRegisterForm
			cancelHref={BOOK_PATH}
			onContinue={(patient) => router.replace(`${BOOK_PATH}?patientId=${patient.patientId}`)}
		/>
	);
}
