import "server-only";

import { httpClient } from "@/lib/axios/httpClient";
import type { Appointment, AppointmentStatus, BookAppointmentResult, PaymentMethod } from "@/types/appointment.types";
import type { DeskBookingPayload } from "@/zod/appointment.validation";
// api-র appointmentListConfig-এর সাথে মিল
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
}

const getAppointments = ({ status, searchTerm, ...rest }: AppointmentListParams) =>
	httpClient.get<Appointment[]>("/appointments", {
		// api-র status filter-এ op: "in" → কমা দিয়ে একাধিক মান
		params: { ...rest, status: status?.join(","), searchTerm: searchTerm || undefined },
	});

const recordDeskPayment = (id: string, method: PaymentMethod) =>
	httpClient.post<unknown>(`/appointments/${id}/desk-payment`, { method });

// httpClient.patch-এ data required; api এই route-এ body পড়ে না
const checkIn = (id: string) => httpClient.patch<Appointment>(`/appointments/${id}/check-in`, {});

// httpClient.patch-এ data required; api body পড়ে না
const undoCheckIn = (id: string) => httpClient.patch<Appointment>(`/appointments/${id}/undo-check-in`, {});

const book = (payload: DeskBookingPayload) => httpClient.post<BookAppointmentResult>("/appointments", payload);

const getAppointment = (id: string) => httpClient.get<Appointment>(`/appointments/${id}`);
const cancel = (id: string, reason: string) => httpClient.patch<Appointment>(`/appointments/${id}/cancel`, { reason });

// httpClient.patch/post-এ data required; api এই route-গুলোতে body পড়ে না
const markNoShow = (id: string) => httpClient.patch<Appointment>(`/appointments/${id}/no-show`, {});

const sendPaymentLink = (id: string) => httpClient.post<BookAppointmentResult>(`/appointments/${id}/payment-link`, {});

export const AppointmentService = {
	getAppointments,
	getAppointment,
	book,
	recordDeskPayment,
	checkIn,
	undoCheckIn,
	cancel,
	markNoShow,
	sendPaymentLink,
};
