import { PrescriptionPrintView } from "@/components/modules/prescription/PrescriptionPrintView";
import { PrintSkeleton } from "@/components/modules/prescription/PrintSkeleton";
import { clinicToday } from "@/lib/clinicDate";
import { AppointmentService } from "@/services/appointment.service";
import type { Appointment } from "@/types/appointment.types";
import { appointmentIdSchema } from "@/zod/appointment.validation";
import { isAxiosError } from "axios";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = { title: "My prescription" };

interface PrintPageProps {
	params: Promise<{ id: string }>;
}

export default function PortalPrescriptionPrintPage({ params }: PrintPageProps) {
	return (
		<Suspense fallback={<PrintSkeleton />}>
			<PrintContent params={params} />
		</Suspense>
	);
}

async function getMyAppointmentOrNotFound(id: string): Promise<Appointment> {
	try {
		const response = await AppointmentService.getMyAppointment(id);
		return response.data;
	} catch (error) {
		if (isAxiosError(error) && error.response?.status === 404) notFound();
		throw error;
	}
}

async function PrintContent({ params }: PrintPageProps) {
	const { id } = await params;
	if (!appointmentIdSchema.safeParse(id).success) notFound();

	const appointment = await getMyAppointmentOrNotFound(id);

	return (
		<PrescriptionPrintView
			appointment={appointment}
			today={clinicToday(new Date())}
			backHref={`/portal/appointments/${id}`}
			backLabel="Back to appointment"
		/>
	);
}
