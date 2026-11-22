import "server-only";

import { httpClient } from "@/lib/axios/httpClient";
import type { CreatePatientResult, PatientRecord, ResetPasswordResult } from "@/types/patient.types";
import type { CreatePatientPayload, PatientListQuery } from "@/zod/patient.validation";

const getPatients = (query: PatientListQuery) =>
	httpClient.get<PatientRecord[]>("/patient-records", {
		// "" পাঠালে URL-এ ?searchTerm= যায়; undefined হলে axios নিজেই বাদ দেয়
		params: { ...query, searchTerm: query.searchTerm || undefined },
	});

const createPatient = (payload: CreatePatientPayload) =>
	httpClient.post<CreatePatientResult>("/patient-records", payload);

const updateAccountStatus = (id: string, isActive: boolean) =>
	httpClient.patch<PatientRecord>(`/patient-records/${id}/account-status`, { isActive });

// httpClient.post-এ data required; api এই route-এ body পড়ে না, তাই খালি object
const resetPassword = (id: string) => httpClient.post<ResetPasswordResult>(`/patient-records/${id}/reset-password`, {});

export const PatientService = { getPatients, createPatient, updateAccountStatus, resetPassword };
