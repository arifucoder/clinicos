import "server-only";

import { httpClient } from "@/lib/axios/httpClient";
import type { PublicSpecialty, Specialty } from "@/types/specialty.types";
import type { CreateSpecialtyPayload, SpecialtyListQuery, UpdateSpecialtyPayload } from "@/zod/specialty.validation";

const getSpecialties = (query: SpecialtyListQuery) =>
	httpClient.get<Specialty[]>("/specialties", {
		params: { ...query, searchTerm: query.searchTerm || undefined },
	});

const createSpecialty = (payload: CreateSpecialtyPayload) => httpClient.post<Specialty>("/specialties", payload);

const updateSpecialty = (id: string, payload: UpdateSpecialtyPayload) =>
	httpClient.patch<Specialty>(`/specialties/${id}`, payload);

const deleteSpecialty = (id: string) => httpClient.delete<null>(`/specialties/${id}`);

const getPublicSpecialties = () => httpClient.get<PublicSpecialty[]>("/public/specialties", { auth: false });

export const SpecialtyService = { getSpecialties, getPublicSpecialties, createSpecialty, updateSpecialty, deleteSpecialty };
