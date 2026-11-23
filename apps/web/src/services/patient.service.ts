import "server-only";

import { httpClient } from "@/lib/axios/httpClient";
import type { CreatePatientResult, MyPatientProfile, PatientRecord, ResetPasswordResult } from "@/types/patient.types";
import type {
	CreatePatientPayload,
	PatientListQuery,
	UpdateMyPatientProfilePayload,
} from "@/zod/patient.validation";

const getPatients = (query: PatientListQuery) =>
	httpClient.get<PatientRecord[]>("/patient-records", {
		params: { ...query, searchTerm: query.searchTerm || undefined },
	});

const createPatient = (payload: CreatePatientPayload) =>
	httpClient.post<CreatePatientResult>("/patient-records", payload);

const updateAccountStatus = (id: string, isActive: boolean) =>
	httpClient.patch<PatientRecord>(`/patient-records/${id}/account-status`, { isActive });

const resetPassword = (id: string) => httpClient.post<ResetPasswordResult>(`/patient-records/${id}/reset-password`, {});

const getPatient = (id: string) => httpClient.get<PatientRecord>(`/patient-records/${id}`);

const getMyProfile = () => httpClient.get<MyPatientProfile>("/patient/me");

const updateMyProfile = (payload: UpdateMyPatientProfilePayload) =>
	httpClient.patch<MyPatientProfile>("/patient/me", payload);

export const PatientService = {
	getPatients,
	getPatient,
	createPatient,
	updateAccountStatus,
	resetPassword,
	getMyProfile,
	updateMyProfile,
};
