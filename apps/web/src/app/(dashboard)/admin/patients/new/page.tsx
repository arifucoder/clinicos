import { PatientRegisterForm } from "@/components/modules/patient/PatientRegisterForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "New patient" };

export default function NewPatientPage() {
	return (
		<div className="space-y-5">
			<Link
				href="/admin/patients"
				className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				Patients
			</Link>
			<PageHeader title="New patient" />
			<PatientRegisterForm />
		</div>
	);
}
