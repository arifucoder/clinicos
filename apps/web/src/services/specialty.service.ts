import "server-only";

import { httpClient } from "@/lib/axios/httpClient";
import type { Specialty } from "@/types/specialty.types";
import type { CreateSpecialtyPayload, SpecialtyListQuery, UpdateSpecialtyPayload } from "@/zod/specialty.validation";

const getSpecialties = (query: SpecialtyListQuery) =>
	httpClient.get<Specialty[]>("/specialties", {
		// "" পাঠালে URL-এ ?searchTerm= যায়; undefined হলে axios নিজেই বাদ দেয়
		params: { ...query, searchTerm: query.searchTerm || undefined },
	});

const createSpecialty = (payload: CreateSpecialtyPayload) => httpClient.post<Specialty>("/specialties", payload);

const updateSpecialty = (id: string, payload: UpdateSpecialtyPayload) =>
	httpClient.patch<Specialty>(`/specialties/${id}`, payload);

const deleteSpecialty = (id: string) => httpClient.delete<null>(`/specialties/${id}`);

export const SpecialtyService = { getSpecialties, createSpecialty, updateSpecialty, deleteSpecialty };
