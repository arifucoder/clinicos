import "server-only";

import { httpClient } from "@/lib/axios/httpClient";
import type { CreateDoctorResult, StaffDoctor } from "@/types/doctor.types";
import type { CreateDoctorPayload, DoctorListQuery, UpdateDoctorPayload } from "@/zod/doctor.validation";

const getDoctors = (query: DoctorListQuery) =>
	httpClient.get<StaffDoctor[]>("/doctors", { params: { ...query, searchTerm: query.searchTerm || undefined } });

// create আছে user module-এ, বাকিগুলো doctor module-এ (api-র route যেমন)
const createDoctor = (payload: CreateDoctorPayload) => httpClient.post<CreateDoctorResult>("/users/doctors", payload);

const updateDoctor = (id: string, payload: UpdateDoctorPayload) =>
	httpClient.patch<StaffDoctor>(`/doctors/${id}`, payload);

const updateDoctorStatus = (id: string, isActive: boolean) =>
	httpClient.patch<StaffDoctor>(`/doctors/${id}/status`, { isActive });

const deleteDoctor = (id: string) => httpClient.delete<null>(`/doctors/${id}`);

export const DoctorService = { getDoctors, createDoctor, updateDoctor, updateDoctorStatus, deleteDoctor };
