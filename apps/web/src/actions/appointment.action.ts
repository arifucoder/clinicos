"use server";

import { toActionError } from "@/lib/actionError";
import { AppointmentService } from "@/services/appointment.service";
import type { ActionError, ActionResult } from "@/types/api.types";
import { appointmentIdSchema, paymentMethodSchema } from "@/zod/appointment.validation";
import { isAxiosError } from "axios";
import { revalidatePath } from "next/cache";

// "layout": /admin/front-desk-এর নিচের সব page (Today, Check-in, Appointments) একসাথে নতুন হয়
const revalidateFrontDesk = () => revalidatePath("/admin/front-desk", "layout");

const invalidInput: ActionError = { success: false, message: "Invalid appointment." };

// 409-এর message api-রটাই ভালো ("Collect the consultation fee first", "Check-in opens 2 hours…"),
// তাই toActionError সেটাই দেখায়; শুধু 404-এ নিজের লেখা
const toAppointmentError = (error: unknown): ActionError => {
	if (isAxiosError(error) && error.response?.status === 404) {
		return { success: false, message: "This appointment no longer exists. Refresh the page." };
	}
	return toActionError(error);
};

export async function collectDeskFeeAction(id: unknown, method: unknown): Promise<ActionResult> {
	const parsedId = appointmentIdSchema.safeParse(id);
	const parsedMethod = paymentMethodSchema.safeParse(method);
	if (!parsedId.success || !parsedMethod.success) return invalidInput;

	try {
		const response = await AppointmentService.recordDeskPayment(parsedId.data, parsedMethod.data);
		revalidateFrontDesk();
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toAppointmentError(error);
	}
}

export async function checkInAppointmentAction(id: unknown): Promise<ActionResult> {
	const parsedId = appointmentIdSchema.safeParse(id);
	if (!parsedId.success) return invalidInput;

	try {
		const response = await AppointmentService.checkIn(parsedId.data);
		revalidateFrontDesk();
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toAppointmentError(error);
	}
}
