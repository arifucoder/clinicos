"use server";

import { toActionError, zodFieldErrors } from "@/lib/actionError";
import { SlotService } from "@/services/slot.service";
import type { ActionError, ActionResult, ApiErrorResponse } from "@/types/api.types";
import type { BlockSlotsResult, OpenSlotsResult } from "@/types/slot.types";
import {
	blockSlotsSchema,
	deleteSlotIdsSchema,
	openSlotsSchema,
	slotDoctorIdSchema,
	slotIdsSchema,
} from "@/zod/slot.validation";
import { isAxiosError } from "axios";
import { revalidatePath } from "next/cache";
import type * as z from "zod";

const SLOT_PATHS = ["/admin/slots", "/doctor/slots"] as const;
const revalidateSlots = () => {
	for (const path of SLOT_PATHS) revalidatePath(path);
};

const toSlotError = (error: unknown): ActionError => {
	if (isAxiosError<ApiErrorResponse>(error) && error.response?.status === 404) {
		return { success: false, message: "This doctor or slot no longer exists. Refresh the page." };
	}
	const result = toActionError(error);
	if (!result.fieldErrors) return result;

	const fieldErrors: Record<string, string> = {};
	for (const [key, message] of Object.entries(result.fieldErrors)) {
		fieldErrors[key.split(".")[0] ?? key] ??= message;
	}
	return { ...result, fieldErrors };
};

const invalidDoctor: ActionError = { success: false, message: "Invalid doctor." };
const invalidSelection: ActionError = { success: false, message: "Invalid slot selection. Refresh and try again." };
const fixFields = (error: z.ZodError): ActionError => ({
	success: false,
	message: "Please fix the highlighted fields.",
	fieldErrors: zodFieldErrors(error),
});

export async function openSlotsAction(doctorId: unknown, input: unknown): Promise<ActionResult<OpenSlotsResult>> {
	const parsedDoctor = slotDoctorIdSchema.safeParse(doctorId);
	if (!parsedDoctor.success) return invalidDoctor;

	const parsed = openSlotsSchema.safeParse(input);
	if (!parsed.success) return fixFields(parsed.error);

	try {
		const response = await SlotService.openSlots(parsedDoctor.data, parsed.data);
		revalidateSlots();
		return { success: true, message: response.message, data: response.data };
	} catch (error) {
		return toSlotError(error);
	}
}

export async function blockSlotsAction(doctorId: unknown, input: unknown): Promise<ActionResult<BlockSlotsResult>> {
	const parsedDoctor = slotDoctorIdSchema.safeParse(doctorId);
	if (!parsedDoctor.success) return invalidDoctor;

	const parsed = blockSlotsSchema.safeParse(input);
	if (!parsed.success) return fixFields(parsed.error);

	try {
		const response = await SlotService.blockSlots(parsedDoctor.data, parsed.data);
		revalidateSlots();
		return { success: true, message: response.message, data: response.data };
	} catch (error) {
		return toSlotError(error);
	}
}

export async function unblockSlotsAction(doctorId: unknown, slotIds: unknown): Promise<ActionResult> {
	const parsedDoctor = slotDoctorIdSchema.safeParse(doctorId);
	const parsedIds = slotIdsSchema.safeParse(slotIds);
	if (!parsedDoctor.success) return invalidDoctor;
	if (!parsedIds.success) return invalidSelection;

	try {
		const response = await SlotService.unblockSlots(parsedDoctor.data, parsedIds.data);
		revalidateSlots();
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toSlotError(error);
	}
}

export async function deleteSlotsAction(
	doctorId: unknown,
	slotIds: unknown,
): Promise<ActionResult<{ deleted: number; failed: number }>> {
	const parsedDoctor = slotDoctorIdSchema.safeParse(doctorId);
	const parsedIds = deleteSlotIdsSchema.safeParse(slotIds);
	if (!parsedDoctor.success) return invalidDoctor;
	if (!parsedIds.success) return invalidSelection;

	const doctor = parsedDoctor.data;
	const results = await Promise.allSettled(parsedIds.data.map((id) => SlotService.deleteSlot(doctor, id)));

	const deleted = results.filter((result) => result.status === "fulfilled").length;
	const failed = results.length - deleted;
	const firstFailure = results.find((result): result is PromiseRejectedResult => result.status === "rejected");

	if (deleted > 0) revalidateSlots();
	if (deleted === 0 && firstFailure) return toSlotError(firstFailure.reason);

	return {
		success: true,
		message:
			failed > 0
				? `Deleted ${deleted}. ${failed} couldn't be deleted (they had bookings) — block them instead.`
				: `Deleted ${deleted} slot${deleted === 1 ? "" : "s"}`,
		data: { deleted, failed },
	};
}
