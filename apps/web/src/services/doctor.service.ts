import "server-only";

import { httpClient } from "@/lib/axios/httpClient";
import { DOCTOR_PAGE_SIZE, DOCTOR_SORTS } from "@/lib/findDoctor";
import type { CreateDoctorResult, PublicDoctor, StaffDoctor } from "@/types/doctor.types";
import type {
	CreateDoctorPayload,
	DoctorListQuery,
	PublicDoctorListQuery,
	UpdateDoctorPayload,
	UpdateMyProfilePayload,
} from "@/zod/doctor.validation";

const getDoctors = (query: DoctorListQuery) =>
	httpClient.get<StaffDoctor[]>("/doctors", { params: { ...query, searchTerm: query.searchTerm || undefined } });

const createDoctor = (payload: CreateDoctorPayload) => httpClient.post<CreateDoctorResult>("/users/doctors", payload);

const updateDoctor = (id: string, payload: UpdateDoctorPayload) =>
	httpClient.patch<StaffDoctor>(`/doctors/${id}`, payload);

const updateDoctorStatus = (id: string, isActive: boolean) =>
	httpClient.patch<StaffDoctor>(`/doctors/${id}/status`, { isActive });

const deleteDoctor = (id: string) => httpClient.delete<null>(`/doctors/${id}`);

const getMyProfile = () => httpClient.get<StaffDoctor>("/doctors/me");

const updateMyProfile = (payload: UpdateMyProfilePayload) => httpClient.patch<StaffDoctor>("/doctors/me", payload);

const uploadMyPhoto = (body: FormData) =>
	httpClient.put<unknown>("/doctors/me/photo", body, { headers: { "Content-Type": "multipart/form-data" } });

const removeMyPhoto = () => httpClient.delete<unknown>("/doctors/me/photo");

const getPublicDoctors = (query: PublicDoctorListQuery, limit = DOCTOR_PAGE_SIZE) => {
	const { sortBy, sortOrder } = DOCTOR_SORTS[query.sort];
	return httpClient.get<PublicDoctor[]>("/public/doctors", {
		auth: false,
		params: {
			page: query.page,
			limit,
			available: query.show === "open" ? true : undefined,
			searchTerm: query.searchTerm || undefined,
			specialty: query.specialty,
			date: query.date,
			sortBy,
			sortOrder,
		},
	});
};

const getPublicDoctorById = (id: string) => httpClient.get<PublicDoctor>(`/public/doctors/${id}`, { auth: false });

export const DoctorService = {
	getPublicDoctors,
	getPublicDoctorById,
	getDoctors,
	createDoctor,
	updateDoctor,
	updateDoctorStatus,
	deleteDoctor,
	getMyProfile,
	updateMyProfile,
	uploadMyPhoto,
	removeMyPhoto,
};
