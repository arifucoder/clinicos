"use server";

import { toActionError, zodFieldErrors } from "@/lib/actionError";
import { SpecialtyService } from "@/services/specialty.service";
import type { ActionError, ActionResult } from "@/types/api.types";
import { createSpecialtySchema, specialtyIdSchema, updateSpecialtySchema } from "@/zod/specialty.validation";
import { isAxiosError } from "axios";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const SPECIALTIES_PATH = "/admin/specialties";

const DUPLICATE_NAME =
	"A specialty with this name already exists (it may have been deleted earlier). Try another name.";

const toSpecialtyError = (error: unknown): ActionError => {
	if (isAxiosError(error)) {
		const status = error.response?.status;
		if (status === 409) return { success: false, message: DUPLICATE_NAME, fieldErrors: { name: DUPLICATE_NAME } };
		if (status === 404) return { success: false, message: "This specialty no longer exists. Refresh the page." };
	}
	return toActionError(error);
};

const invalidId: ActionError = { success: false, message: "Invalid specialty." };

export async function createSpecialtyAction(input: unknown): Promise<ActionResult> {
	const parsed = createSpecialtySchema.safeParse(input);
	if (!parsed.success) {
		return { success: false, message: "Please fix the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error) };
	}

	try {
		const response = await SpecialtyService.createSpecialty(parsed.data);
		revalidatePath(SPECIALTIES_PATH);
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toSpecialtyError(error);
	}
}

export async function updateSpecialtyAction(id: unknown, input: unknown): Promise<ActionResult> {
	const parsedId = specialtyIdSchema.safeParse(id);
	if (!parsedId.success) return invalidId;

	const parsed = updateSpecialtySchema.safeParse(input);
	if (!parsed.success) {
		return { success: false, message: "Please fix the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error) };
	}

	try {
		const response = await SpecialtyService.updateSpecialty(parsedId.data, parsed.data);
		revalidatePath(SPECIALTIES_PATH);
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toSpecialtyError(error);
	}
}

export async function toggleSpecialtyStatusAction(id: unknown, isActive: unknown): Promise<ActionResult> {
	const parsedId = specialtyIdSchema.safeParse(id);
	const parsedActive = z.boolean().safeParse(isActive);
	if (!parsedId.success || !parsedActive.success) return invalidId;

	try {
		await SpecialtyService.updateSpecialty(parsedId.data, { isActive: parsedActive.data });
		revalidatePath(SPECIALTIES_PATH);
		return { success: true, message: parsedActive.data ? "Specialty activated" : "Specialty deactivated", data: null };
	} catch (error) {
		return toSpecialtyError(error);
	}
}

export async function deleteSpecialtyAction(id: unknown): Promise<ActionResult> {
	const parsedId = specialtyIdSchema.safeParse(id);
	if (!parsedId.success) return invalidId;

	try {
		const response = await SpecialtyService.deleteSpecialty(parsedId.data);
		revalidatePath(SPECIALTIES_PATH);
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toSpecialtyError(error);
	}
}
