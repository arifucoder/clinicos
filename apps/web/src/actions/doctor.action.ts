"use server";

import { toActionError, zodFieldErrors } from "@/lib/actionError";
import { DoctorService } from "@/services/doctor.service";
import { DOCTOR_GRID_PAGE_SIZE } from "@/lib/findDoctor";
import type { ActionError, ActionResult, ApiErrorResponse, PaginationMeta } from "@/types/api.types";
import type { PublicDoctor } from "@/types/doctor.types";
import {
	createDoctorSchema,
	doctorIdSchema,
	PHOTO_MAX_BYTES,
	PHOTO_TYPES,
	publicDoctorListQuerySchema,
	updateDoctorSchema,
	updateMyProfileSchema,
} from "@/zod/doctor.validation";
import { isAxiosError } from "axios";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const STAFF_PATH = "/admin/staff";
const EMAIL_TAKEN = "An account with this email already exists.";
const LICENSE_TAKEN = "A doctor with this license number already exists.";
const SPECIALTY_INACTIVE = "One of these specialties is no longer active. Refresh and pick again.";

const toFormField = (key: string) => (key === "consultationFeeCents" ? "fee" : key);

const toDoctorError = (error: unknown): ActionError => {
	if (isAxiosError<ApiErrorResponse>(error)) {
		const status = error.response?.status;
		const message = error.response?.data?.message ?? "";

		if (status === 409 && /license/i.test(message)) {
			return { success: false, message: LICENSE_TAKEN, fieldErrors: { licenseNumber: LICENSE_TAKEN } };
		}
		if (status === 409) return { success: false, message: EMAIL_TAKEN, fieldErrors: { email: EMAIL_TAKEN } };
		if (status === 400 && /specialt/i.test(message)) {
			return { success: false, message: SPECIALTY_INACTIVE, fieldErrors: { specialtyIds: SPECIALTY_INACTIVE } };
		}
		if (status === 404) return { success: false, message: "This doctor no longer exists. Refresh the page." };
	}

	const result = toActionError(error);
	if (!result.fieldErrors) return result;
	return {
		...result,
		fieldErrors: Object.fromEntries(
			Object.entries(result.fieldErrors).map(([key, value]) => [toFormField(key), value]),
		),
	};
};

const invalidId: ActionError = { success: false, message: "Invalid doctor." };
const fixFields = (error: z.ZodError): ActionError => ({
	success: false,
	message: "Please fix the highlighted fields.",
	fieldErrors: zodFieldErrors(error),
});

export async function createDoctorAction(input: unknown): Promise<ActionResult<{ emailSent: boolean }>> {
	const parsed = createDoctorSchema.safeParse(input);
	if (!parsed.success) return fixFields(parsed.error);

	try {
		const response = await DoctorService.createDoctor(parsed.data);
		revalidatePath(STAFF_PATH);
		return { success: true, message: response.message, data: { emailSent: response.data.emailSent } };
	} catch (error) {
		return toDoctorError(error);
	}
}

export async function updateDoctorAction(id: unknown, input: unknown): Promise<ActionResult> {
	const parsedId = doctorIdSchema.safeParse(id);
	if (!parsedId.success) return invalidId;

	const parsed = updateDoctorSchema.safeParse(input);
	if (!parsed.success) return fixFields(parsed.error);

	try {
		const response = await DoctorService.updateDoctor(parsedId.data, parsed.data);
		revalidatePath(STAFF_PATH);
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toDoctorError(error);
	}
}

export async function toggleDoctorStatusAction(id: unknown, isActive: unknown): Promise<ActionResult> {
	const parsedId = doctorIdSchema.safeParse(id);
	const parsedActive = z.boolean().safeParse(isActive);
	if (!parsedId.success || !parsedActive.success) return invalidId;

	try {
		const response = await DoctorService.updateDoctorStatus(parsedId.data, parsedActive.data);
		revalidatePath(STAFF_PATH);
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toDoctorError(error);
	}
}

export async function deleteDoctorAction(id: unknown): Promise<ActionResult> {
	const parsedId = doctorIdSchema.safeParse(id);
	if (!parsedId.success) return invalidId;

	try {
		const response = await DoctorService.deleteDoctor(parsedId.data);
		revalidatePath(STAFF_PATH);
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toDoctorError(error);
	}
}

const PROFILE_PATH = "/doctor/profile";

export async function updateMyProfileAction(input: unknown): Promise<ActionResult> {
	const parsed = updateMyProfileSchema.safeParse(input);
	if (!parsed.success) return fixFields(parsed.error);

	try {
		const response = await DoctorService.updateMyProfile(parsed.data);
		revalidatePath(PROFILE_PATH);
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toActionError(error);
	}
}

export async function uploadMyPhotoAction(formData: FormData): Promise<ActionResult> {
	const photo = formData.get("photo");
	if (!(photo instanceof File) || photo.size === 0) return { success: false, message: "Choose a photo to upload." };
	if (!PHOTO_TYPES.includes(photo.type)) {
		return { success: false, message: "Only JPEG, PNG or WebP images are allowed." };
	}
	if (photo.size > PHOTO_MAX_BYTES) return { success: false, message: "Photo must be 2 MB or smaller." };

	const body = new FormData();
	body.append("photo", photo, photo.name);

	try {
		const response = await DoctorService.uploadMyPhoto(body);
		revalidatePath(PROFILE_PATH);
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toActionError(error);
	}
}

export async function removeMyPhotoAction(): Promise<ActionResult> {
	try {
		const response = await DoctorService.removeMyPhoto();
		revalidatePath(PROFILE_PATH);
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toActionError(error);
	}
}

// Find a doctor: next page for infinite scroll (the browser never calls the API directly)
export async function loadPublicDoctorsAction(
	query: unknown,
	page: unknown,
): Promise<ActionResult<{ doctors: PublicDoctor[]; meta: PaginationMeta }>> {
	const parsedPage = z.coerce.number().int().min(1).max(500).safeParse(page);
	if (!parsedPage.success) return { success: false, message: "Invalid page." };

	const parsed = publicDoctorListQuerySchema.parse(query);

	try {
		const response = await DoctorService.getPublicDoctors({ ...parsed, page: parsedPage.data }, DOCTOR_GRID_PAGE_SIZE);
		const meta = response.meta ?? {
			page: parsedPage.data,
			limit: DOCTOR_GRID_PAGE_SIZE,
			total: response.data.length,
			totalPages: parsedPage.data,
		};
		return { success: true, message: response.message, data: { doctors: response.data, meta } };
	} catch (error) {
		return toActionError(error);
	}
}
