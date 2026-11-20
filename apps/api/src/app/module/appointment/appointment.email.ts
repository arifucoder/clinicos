import { envVars } from "@/app/config/env";
import { sendEmail } from "@/app/shared/sendEmail";
import { formatMoney } from "@/app/utils/money";
import { formatClinicTime } from "../slot/slot.utils";

const TZ = envVars.CLINIC_TIME_ZONE;

export type TEmailAppointment = {
	appointmentNumber: string;
	startAt: Date;
	feeCents: number;
	patient: { fullName: string; user: { email: string } };
	doctor: { user: { name: string } };
};

export const sendSafely = async (label: string, task: () => Promise<void>) => {
	try {
		await task();
	} catch (error) {
		console.error(`[email] ${label} failed:`, error instanceof Error ? error.message : error);
	}
};

const common = (appointment: TEmailAppointment) => ({
	name: appointment.patient.fullName,
	appointmentNumber: appointment.appointmentNumber,
	doctorName: appointment.doctor.user.name,
	whenLabel: formatClinicTime(appointment.startAt, TZ),
});

export const emailAppointmentConfirmed = (appointment: TEmailAppointment, paymentLabel: string) =>
	sendEmail({
		to: appointment.patient.user.email,
		subject: `Appointment confirmed · ${appointment.appointmentNumber}`,
		previewText: `Dr. ${appointment.doctor.user.name} · ${formatClinicTime(appointment.startAt, TZ)}`,
		template: "appointmentConfirmed",
		data: { ...common(appointment), paymentLabel, portalUrl: `${envVars.FRONTEND_URL}/portal/appointments` },
	});

export const emailAppointmentCancelled = (appointment: TEmailAppointment, reason: string, refundNote: string | null) =>
	sendEmail({
		to: appointment.patient.user.email,
		subject: `Appointment cancelled · ${appointment.appointmentNumber}`,
		previewText: reason,
		template: "appointmentCancelled",
		data: { ...common(appointment), reason, refundNote, bookUrl: `${envVars.FRONTEND_URL}/doctors` },
	});

export const emailPaymentLink = (appointment: TEmailAppointment, payUrl: string, currency: string, expiresAt: Date) =>
	sendEmail({
		to: appointment.patient.user.email,
		subject: `Pay to confirm ${appointment.appointmentNumber}`,
		previewText: `Consultation fee ${formatMoney(appointment.feeCents, currency)}`,
		template: "paymentLink",
		data: {
			...common(appointment),
			amountLabel: formatMoney(appointment.feeCents, currency),
			payUrl,
			expiresLabel: formatClinicTime(expiresAt, TZ),
		},
	});
