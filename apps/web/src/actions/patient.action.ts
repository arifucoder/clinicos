"use server";

import { toActionError, zodFieldErrors } from "@/lib/actionError";
import { PatientService } from "@/services/patient.service";
import type { ActionError, ActionResult, ApiErrorResponse } from "@/types/api.types";
import type { RegisteredPatient, ResetPasswordResult } from "@/types/patient.types";
import { createPatientSchema, patientIdSchema, updateMyPatientProfileSchema } from "@/zod/patient.validation";
import { isAxiosError } from "axios";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const PATIENTS_PATH = "/admin/patients";

const fixFields = (error: z.ZodError): ActionError => ({
	success: false,
	message: "Please fix the highlighted fields.",
	fieldErrors: zodFieldErrors(error),
});

const invalidId: ActionError = { success: false, message: "Invalid patient." };

const toPatientError = (error: unknown): ActionError => {
	if (isAxiosError<ApiErrorResponse>(error)) {
		const status = error.response?.status;
		if (status === 409) {
			const message = error.response?.data?.message ?? "An account with this email already exists.";
			return { success: false, message, fieldErrors: { email: message } };
		}
		if (status === 404) return { success: false, message: "This patient no longer exists. Refresh the page." };
	}
	return toActionError(error);
};

export async function createPatientAction(input: unknown): Promise<ActionResult<RegisteredPatient>> {
	const parsed = createPatientSchema.safeParse(input);
	if (!parsed.success) return fixFields(parsed.error);

	try {
		const response = await PatientService.createPatient(parsed.data);
		const { patient, temporaryPassword, emailSent } = response.data;
		revalidatePath(PATIENTS_PATH);
		return {
			success: true,
			message: response.message,
			data: {
				patientId: patient.id,
				fullName: patient.fullName,
				email: patient.user.email,
				temporaryPassword,
				emailSent,
			},
		};
	} catch (error) {
		return toPatientError(error);
	}
}

export async function togglePatientStatusAction(id: unknown, isActive: unknown): Promise<ActionResult> {
	const parsedId = patientIdSchema.safeParse(id);
	const parsedActive = z.boolean().safeParse(isActive);
	if (!parsedId.success || !parsedActive.success) return invalidId;

	try {
		const response = await PatientService.updateAccountStatus(parsedId.data, parsedActive.data);
		revalidatePath(PATIENTS_PATH);
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toPatientError(error);
	}
}

export async function resetPatientPasswordAction(id: unknown): Promise<ActionResult<ResetPasswordResult>> {
	const parsedId = patientIdSchema.safeParse(id);
	if (!parsedId.success) return invalidId;

	try {
		const response = await PatientService.resetPassword(parsedId.data);
		revalidatePath(PATIENTS_PATH);
		return { success: true, message: response.message, data: response.data };
	} catch (error) {
		return toPatientError(error);
	}
}

export async function updateMyPatientProfileAction(input: unknown): Promise<ActionResult> {
	const parsed = updateMyPatientProfileSchema.safeParse(input);
	if (!parsed.success) return fixFields(parsed.error);

	try {
		const response = await PatientService.updateMyProfile(parsed.data);
		revalidatePath("/portal", "layout");
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toActionError(error);
	}
}
