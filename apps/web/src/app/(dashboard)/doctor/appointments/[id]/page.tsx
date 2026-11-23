import { PatientPanel } from "@/components/modules/consultation/PatientPanel";
import { PrescriptionForm } from "@/components/modules/consultation/PrescriptionForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusPill } from "@/components/shared/StatusPill";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { APPOINTMENT_STATUS_META } from "@/lib/appointmentDisplay";
import { clinicToday, formatClinicTime } from "@/lib/clinicDate";
import { AppointmentService } from "@/services/appointment.service";
import { appointmentIdSchema } from "@/zod/appointment.validation";
import { isAxiosError } from "axios";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Consultation" };

interface ConsultationPageProps {
	params: Promise<{ id: string }>;
}

export default function ConsultationPage({ params }: ConsultationPageProps) {
	return (
		<Suspense fallback={<ConsultationSkeleton />}>
			<ConsultationContent params={params} />
		</Suspense>
	);
}

async function getAppointmentOrNotFound(id: string) {
	try {
		const response = await AppointmentService.getAppointment(id);
		return response.data;
	} catch (error) {
		if (isAxiosError(error) && error.response?.status === 404) notFound();
		throw error; // বাকি সব error.tsx-এ
	}
}

async function ConsultationContent({ params }: ConsultationPageProps) {
	const { id } = await params;
	if (!appointmentIdSchema.safeParse(id).success) notFound();

	const appointment = await getAppointmentOrNotFound(id);

	const historyResponse = await AppointmentService.getAppointments({
		patientId: appointment.patient.id,
		status: ["COMPLETED"],
		sortBy: "startAt",
		sortOrder: "desc",
		limit: 6,
	});
	const history = historyResponse.data.filter((visit) => visit.id !== appointment.id).slice(0, 5);
	const historyTotal =
		(historyResponse.meta?.total ?? historyResponse.data.length) - (appointment.status === "COMPLETED" ? 1 : 0);

	const today = clinicToday(new Date());
	const status = APPOINTMENT_STATUS_META[appointment.status];
	const canWrite = appointment.status === "CHECKED_IN" || appointment.status === "COMPLETED";

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Button variant="ghost" size="sm" render={<Link href="/doctor" />} nativeButton={false} className="-ml-2">
					<ArrowLeft aria-hidden="true" />
					Today&rsquo;s patients
				</Button>
				<PageHeader title={appointment.patient.fullName} />
				<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
					<span className="tabular-nums">{formatClinicTime(appointment.startAt)}</span>
					<span aria-hidden="true">·</span>
					<span>{appointment.appointmentNumber}</span>
					<StatusPill tone={status.tone}>{status.label}</StatusPill>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
				<PatientPanel appointment={appointment} history={history} historyTotal={historyTotal} today={today} />

				{canWrite ? (
					<PrescriptionForm appointment={appointment} today={today} />
				) : (
					<div className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
						A prescription can be written after the patient checks in. Current status: {status.label}.
					</div>
				)}
			</div>
		</div>
	);
}

function ConsultationSkeleton() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Skeleton className="h-8 w-40" />
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-4 w-48" />
			</div>
			<div className="grid gap-6 lg:grid-cols-[320px_1fr]">
				<div className="space-y-4">
					<Skeleton className="h-36 rounded-xl" />
					<Skeleton className="h-48 rounded-xl" />
				</div>
				<Skeleton className="h-[520px] rounded-xl" />
			</div>
		</div>
	);
}
