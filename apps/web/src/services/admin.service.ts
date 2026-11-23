import "server-only";

import { httpClient } from "@/lib/axios/httpClient";
import type { CreateAdminResult, StaffAdmin } from "@/types/admin.types";
import type { AdminListQuery, CreateAdminPayload, UpdateAdminPayload } from "@/zod/admin.validation";

const getAdmins = (query: AdminListQuery) =>
	httpClient.get<StaffAdmin[]>("/admins", { params: { ...query, searchTerm: query.searchTerm || undefined } });

const createAdmin = (payload: CreateAdminPayload) => httpClient.post<CreateAdminResult>("/users/admins", payload);

const updateAdmin = (id: string, payload: UpdateAdminPayload) => httpClient.patch<StaffAdmin>(`/admins/${id}`, payload);

const updateAdminStatus = (id: string, isActive: boolean) =>
	httpClient.patch<StaffAdmin>(`/admins/${id}/status`, { isActive });

const deleteAdmin = (id: string) => httpClient.delete<null>(`/admins/${id}`);

export const AdminService = { getAdmins, createAdmin, updateAdmin, updateAdminStatus, deleteAdmin };
