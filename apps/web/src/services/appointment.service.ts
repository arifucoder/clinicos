import "server-only";

import { httpClient } from "@/lib/axios/httpClient";
import type { PrescriptionPayload } from "@/lib/prescriptionForm";
import type {
	Appointment,
	AppointmentPeriod,
	AppointmentStatus, BookAppointmentResult, PaymentMethod } from "@/types/appointment.types";
import type { DeskBookingPayload, MyBookingPayload } from "@/zod/appointment.validation";
export interface AppointmentListParams {
	date?: string; // "YYYY-MM-DD", clinic-এর দিন
	status?: AppointmentStatus[];
	doctorId?: string;
	searchTerm?: string;
	sortBy?: "startAt" | "createdAt" | "appointmentNumber";
	sortOrder?: "asc" | "desc";
	page?: number;
	limit?: number;
	source?: Appointment["source"];
	patientId?: string;
}

const getAppointments = ({ status, searchTerm, ...rest }: AppointmentListParams) =>
	httpClient.get<Appointment[]>("/appointments", {
		params: { ...rest, status: status?.join(","), searchTerm: searchTerm || undefined },
	});

const recordDeskPayment = (id: string, method: PaymentMethod) =>
	httpClient.post<unknown>(`/appointments/${id}/desk-payment`, { method });

const checkIn = (id: string) => httpClient.patch<Appointment>(`/appointments/${id}/check-in`, {});

const undoCheckIn = (id: string) => httpClient.patch<Appointment>(`/appointments/${id}/undo-check-in`, {});

const book = (payload: DeskBookingPayload) => httpClient.post<BookAppointmentResult>("/appointments", payload);

const getAppointment = (id: string) => httpClient.get<Appointment>(`/appointments/${id}`);
const cancel = (id: string, reason: string) => httpClient.patch<Appointment>(`/appointments/${id}/cancel`, { reason });

const markNoShow = (id: string) => httpClient.patch<Appointment>(`/appointments/${id}/no-show`, {});

const sendPaymentLink = (id: string) => httpClient.post<BookAppointmentResult>(`/appointments/${id}/payment-link`, {});

const savePrescription = (id: string, payload: PrescriptionPayload) =>
	httpClient.put<Appointment>(`/appointments/${id}/prescription`, payload);

const complete = (id: string) => httpClient.patch<Appointment>(`/appointments/${id}/complete`, {});
const getMyAppointment = (id: string) => httpClient.get<Appointment>(`/patient/appointments/${id}`);

export interface MyAppointmentListParams {
	status?: AppointmentStatus[];
	searchTerm?: string; // doctor-এর নাম বা appointment no.
	from?: string; // "YYYY-MM-DD" clinic-এর দিন, দুই প্রান্তই সহ
	to?: string;
	sortBy?: "startAt" | "createdAt";
	sortOrder?: "asc" | "desc";
	page?: number;
	limit?: number;
}

const getMyAppointments = ({ status, searchTerm, ...rest }: MyAppointmentListParams) =>
	httpClient.get<Appointment[]>("/patient/appointments", {
		params: { ...rest, status: status?.join(","), searchTerm: searchTerm || undefined },
	});

const getMyAppointmentPeriods = (status: AppointmentStatus[]) =>
	httpClient.get<AppointmentPeriod[]>("/patient/appointments/periods", { params: { status: status.join(",") } });

const cancelMyAppointment = (id: string, reason?: string) =>
	httpClient.patch<Appointment>(`/patient/appointments/${id}/cancel`, reason ? { reason } : {});

const payMyAppointment = (id: string) => httpClient.post<BookAppointmentResult>(`/patient/appointments/${id}/pay`, {});
const bookMine = (payload: MyBookingPayload) => httpClient.post<BookAppointmentResult>("/appointments", payload);

export const AppointmentService = {
	bookMine,
	getAppointments,
	getAppointment,
	book,
	recordDeskPayment,
	checkIn,
	undoCheckIn,
	cancel,
	markNoShow,
	sendPaymentLink,
	savePrescription,
	complete,
	getMyAppointment,
	getMyAppointments,
	getMyAppointmentPeriods,
	cancelMyAppointment,
	payMyAppointment,
};
