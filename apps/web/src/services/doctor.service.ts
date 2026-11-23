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

// create আছে user module-এ, বাকিগুলো doctor module-এ (api-র route যেমন)
const createDoctor = (payload: CreateDoctorPayload) => httpClient.post<CreateDoctorResult>("/users/doctors", payload);

const updateDoctor = (id: string, payload: UpdateDoctorPayload) =>
	httpClient.patch<StaffDoctor>(`/doctors/${id}`, payload);

const updateDoctorStatus = (id: string, isActive: boolean) =>
	httpClient.patch<StaffDoctor>(`/doctors/${id}/status`, { isActive });

const deleteDoctor = (id: string) => httpClient.delete<null>(`/doctors/${id}`);
// api session থেকে নিজের doctorProfile বের করে → id পাঠাই না

const getMyProfile = () => httpClient.get<StaffDoctor>("/doctors/me");

const updateMyProfile = (payload: UpdateMyProfilePayload) => httpClient.patch<StaffDoctor>("/doctors/me", payload);

// header বদলাতেই হবে: default json থাকলে axios FormData-কে JSON বানিয়ে ফেলে, multer file পায় না।
// axios নিজে boundary যোগ করে দেয়।
const uploadMyPhoto = (body: FormData) =>
	httpClient.put<unknown>("/doctors/me/photo", body, { headers: { "Content-Type": "multipart/form-data" } });

const removeMyPhoto = () => httpClient.delete<unknown>("/doctors/me/photo");

// public find-doctor page: login লাগে না, তাই cookie পাঠাই না (auth: false)
const getPublicDoctors = (query: PublicDoctorListQuery) => {
	const { sortBy, sortOrder } = DOCTOR_SORTS[query.sort];
	return httpClient.get<PublicDoctor[]>("/public/doctors", {
		auth: false,
		params: {
			page: query.page,
			limit: DOCTOR_PAGE_SIZE,
			searchTerm: query.searchTerm || undefined,
			specialty: query.specialty,
			date: query.date,
			sortBy,
			sortOrder,
		},
	});
};

export const DoctorService = {
	getPublicDoctors,
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
