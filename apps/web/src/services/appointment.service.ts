import "server-only";

import { httpClient } from "@/lib/axios/httpClient";
import type { Appointment, AppointmentStatus, PaymentMethod } from "@/types/appointment.types";

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

export const AppointmentService = { getAppointments, recordDeskPayment, checkIn };
