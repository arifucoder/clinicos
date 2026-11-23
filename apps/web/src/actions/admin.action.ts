"use server";

import { toActionError, zodFieldErrors } from "@/lib/actionError";
import { AdminService } from "@/services/admin.service";
import type { ActionError, ActionResult } from "@/types/api.types";
import { adminIdSchema, createAdminSchema, updateAdminSchema } from "@/zod/admin.validation";
import { isAxiosError } from "axios";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const STAFF_PATH = "/admin/staff";
const EMAIL_TAKEN = "An account with this email already exists.";

const toAdminError = (error: unknown): ActionError => {
	if (isAxiosError(error)) {
		const status = error.response?.status;
		if (status === 409) return { success: false, message: EMAIL_TAKEN, fieldErrors: { email: EMAIL_TAKEN } };
		if (status === 404) return { success: false, message: "This admin no longer exists. Refresh the page." };
		if (status === 403) return { success: false, message: "Only the super admin can manage admins." };
	}
	return toActionError(error);
};

const invalidId: ActionError = { success: false, message: "Invalid admin." };
const fixFields = (error: z.ZodError): ActionError => ({
	success: false,
	message: "Please fix the highlighted fields.",
	fieldErrors: zodFieldErrors(error),
});

export async function createAdminAction(input: unknown): Promise<ActionResult<{ emailSent: boolean }>> {
	const parsed = createAdminSchema.safeParse(input);
	if (!parsed.success) return fixFields(parsed.error);

	try {
		const response = await AdminService.createAdmin(parsed.data);
		revalidatePath(STAFF_PATH);
		return { success: true, message: response.message, data: { emailSent: response.data.emailSent } };
	} catch (error) {
		return toAdminError(error);
	}
}

export async function updateAdminAction(id: unknown, input: unknown): Promise<ActionResult> {
	const parsedId = adminIdSchema.safeParse(id);
	if (!parsedId.success) return invalidId;

	const parsed = updateAdminSchema.safeParse(input);
	if (!parsed.success) return fixFields(parsed.error);

	try {
		const response = await AdminService.updateAdmin(parsedId.data, parsed.data);
		revalidatePath(STAFF_PATH);
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toAdminError(error);
	}
}

export async function toggleAdminStatusAction(id: unknown, isActive: unknown): Promise<ActionResult> {
	const parsedId = adminIdSchema.safeParse(id);
	const parsedActive = z.boolean().safeParse(isActive);
	if (!parsedId.success || !parsedActive.success) return invalidId;

	try {
		await AdminService.updateAdminStatus(parsedId.data, parsedActive.data);
		revalidatePath(STAFF_PATH);
		return {
			success: true,
			message: parsedActive.data ? "Admin activated" : "Admin deactivated and signed out",
			data: null,
		};
	} catch (error) {
		return toAdminError(error);
	}
}

export async function deleteAdminAction(id: unknown): Promise<ActionResult> {
	const parsedId = adminIdSchema.safeParse(id);
	if (!parsedId.success) return invalidId;

	try {
		const response = await AdminService.deleteAdmin(parsedId.data);
		revalidatePath(STAFF_PATH);
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toAdminError(error);
	}
}
