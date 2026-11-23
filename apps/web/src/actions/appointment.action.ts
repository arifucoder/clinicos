"use server";

import { AppointmentService } from "@/services/appointment.service";
import type { ActionError, ActionResult } from "@/types/api.types";
import { isAxiosError } from "axios";
import { revalidatePath } from "next/cache";
// import-এ যোগ
import { toActionError, zodFieldErrors } from "@/lib/actionError";
import { toPrescriptionPayload } from "@/lib/prescriptionForm";
import {
	appointmentIdSchema,
	cancelAppointmentSchema,
	cancelMyAppointmentSchema,
	deskBookingSchema,
	myBookingSchema,
	paymentMethodSchema,
} from "@/zod/appointment.validation";
import { SlotService } from "@/services/slot.service";
import type { BookingSlot, MyBookedAppointment } from "@/types/appointment.types";
import { doctorIdSchema } from "@/zod/doctor.validation";
import { prescriptionFormSchema } from "@/zod/prescription.validation";
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

export async function undoCheckInAction(id: unknown): Promise<ActionResult> {
	const parsedId = appointmentIdSchema.safeParse(id);
	if (!parsedId.success) return invalidInput;

	try {
		const response = await AppointmentService.undoCheckIn(parsedId.data);
		revalidateFrontDesk();
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toAppointmentError(error);
	}
}

export async function bookForPatientAction(input: unknown): Promise<ActionResult<{ appointmentId: string }>> {
	const parsed = deskBookingSchema.safeParse(input);
	if (!parsed.success) {
		return {
			success: false,
			message: parsed.error.issues[0]?.message ?? "Invalid booking.",
			fieldErrors: zodFieldErrors(parsed.error),
		};
	}

	try {
		const response = await AppointmentService.book(parsed.data);
		revalidateFrontDesk();
		return { success: true, message: response.message, data: { appointmentId: response.data.appointment.id } };
	} catch (error) {
		// 409 "This time was just booked", "already has APT-… same day", "Check-in opens 2 hours…" — api-র message-ই দেখাই
		return toActionError(error);
	}
}

export async function cancelAppointmentAction(id: unknown, input: unknown): Promise<ActionResult> {
	const parsedId = appointmentIdSchema.safeParse(id);
	if (!parsedId.success) return invalidInput;

	const parsed = cancelAppointmentSchema.safeParse(input);
	if (!parsed.success) {
		return {
			success: false,
			message: parsed.error.issues[0]?.message ?? "Invalid reason.",
			fieldErrors: zodFieldErrors(parsed.error),
		};
	}

	try {
		const response = await AppointmentService.cancel(parsedId.data, parsed.data.reason);
		revalidateFrontDesk();
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toAppointmentError(error);
	}
}

export async function markNoShowAction(id: unknown): Promise<ActionResult> {
	const parsedId = appointmentIdSchema.safeParse(id);
	if (!parsedId.success) return invalidInput;

	try {
		const response = await AppointmentService.markNoShow(parsedId.data);
		revalidateFrontDesk();
		return { success: true, message: response.message, data: null };
	} catch (error) {
		// 409 "No-show can be marked 30 minutes after…" — api-র message-ই দেখাই
		return toAppointmentError(error);
	}
}

export async function sendPaymentLinkAction(id: unknown): Promise<ActionResult> {
	const parsedId = appointmentIdSchema.safeParse(id);
	if (!parsedId.success) return invalidInput;

	try {
		const response = await AppointmentService.sendPaymentLink(parsedId.data);
		revalidateFrontDesk(); // status PENDING_PAYMENT হয়, hold নতুন করে শুরু
		return { success: true, message: response.message, data: null };
	} catch (error) {
		return toAppointmentError(error);
	}
}

// "layout": /doctor (Today) আর /doctor/appointments/[id] দুটোই নতুন হয়
const revalidateDoctor = () => revalidatePath("/doctor", "layout");

export async function savePrescriptionAction(id: unknown, input: unknown): Promise<ActionResult> {
	const parsedId = appointmentIdSchema.safeParse(id);
	if (!parsedId.success) return invalidInput;

	// client-এ validate হলেও server-এ আবার: action একটা public endpoint
	const parsed = prescriptionFormSchema.safeParse(input);
	if (!parsed.success) {
		return {
			success: false,
			message: parsed.error.issues[0]?.message ?? "Invalid prescription.",
			fieldErrors: zodFieldErrors(parsed.error),
		};
	}

	try {
		const response = await AppointmentService.savePrescription(parsedId.data, toPrescriptionPayload(parsed.data));
		revalidateDoctor();
		return { success: true, message: response.message, data: null };
	} catch (error) {
		// 409 "A prescription can be written only after check-in", 403 অন্য doctor-এর
		return toAppointmentError(error);
	}
}

export async function completeAppointmentAction(id: unknown): Promise<ActionResult> {
	const parsedId = appointmentIdSchema.safeParse(id);
	if (!parsedId.success) return invalidInput;

	try {
		const response = await AppointmentService.complete(parsedId.data);
		revalidateDoctor();
		return { success: true, message: response.message, data: null };
	} catch (error) {
		// 409 "Write the prescription before completing" / "just changed — refresh"
		return toAppointmentError(error);
	}
}

// ---------- Patient portal ----------
// "layout": /portal (Home) আর /portal/appointments দুটোই নতুন হয়
const revalidatePortal = () => revalidatePath("/portal", "layout");

export async function cancelMyAppointmentAction(id: unknown, input: unknown): Promise<ActionResult> {
	const parsedId = appointmentIdSchema.safeParse(id);
	if (!parsedId.success) return invalidInput;

	const parsed = cancelMyAppointmentSchema.safeParse(input);
	if (!parsed.success) {
		return {
			success: false,
			message: parsed.error.issues[0]?.message ?? "Invalid reason.",
			fieldErrors: zodFieldErrors(parsed.error),
		};
	}

	try {
		// patientId পাঠাই না: api session থেকে নেয়, অন্য রোগীর appointment → 404 (IDOR-safe)
		const response = await AppointmentService.cancelMyAppointment(parsedId.data, parsed.data.reason);
		revalidatePortal();
		return { success: true, message: response.message, data: null };
	} catch (error) {
		// 409 "Online cancellation closes 2 hours before…", "You paid at the front desk…" — api-র message-ই দেখাই
		return toAppointmentError(error);
	}
}

export async function payMyAppointmentAction(id: unknown): Promise<ActionResult<{ checkoutUrl: string }>> {
	const parsedId = appointmentIdSchema.safeParse(id);
	if (!parsedId.success) return invalidInput;

	try {
		const response = await AppointmentService.payMyAppointment(parsedId.data);
		const { checkoutUrl } = response.data;
		if (!checkoutUrl) return { success: false, message: "Couldn't start the payment. Please try again." };
		return { success: true, message: response.message, data: { checkoutUrl } };
	} catch (error) {
		// 409 "already paid" / "The booking hold has ended — please book again"
		return toAppointmentError(error);
	}
}

// ---------- Patient: নিজের booking ----------
// api-র message দেখে ধরন বুঝি (api error code পাঠায় না)। message বদলালে এখানেও বদলাতে হবে।
const toMyBookingError = (error: unknown): ActionError => {
	const base = toActionError(error);
	if (!isAxiosError(error)) return base;

	const status = error.response?.status;
	// "already has APT-… with this doctor on the same day" → slot ঠিক আছে, রোগীর নিজের সমস্যা
	const isSameDayDuplicate = base.message.includes("already has");

	if ((status === 409 && !isSameDayDuplicate) || (status === 404 && base.message === "Slot not found")) {
		return { ...base, code: "SLOT_TAKEN" };
	}
	// "Online bookings must be at least 60 minutes ahead" / "already ended" → এই slot আর চলবে না
	if (status === 400 && /minutes ahead|already ended|Booking is open until/.test(base.message)) {
		return { ...base, code: "SLOT_TAKEN" };
	}
	if (status === 400 && base.message === "Complete your profile first") {
		return { ...base, code: "PROFILE_INCOMPLETE" };
	}
	return base;
};

export async function bookMyAppointmentAction(
	input: unknown,
): Promise<ActionResult<{ appointment: MyBookedAppointment; checkoutUrl: string | null }>> {
	const parsed = myBookingSchema.safeParse(input);
	if (!parsed.success) {
		return {
			success: false,
			message: parsed.error.issues[0]?.message ?? "Invalid booking.",
			fieldErrors: zodFieldErrors(parsed.error),
		};
	}

	try {
		const response = await AppointmentService.bookMine(parsed.data);
		const { appointment, checkoutUrl } = response.data;
		revalidatePortal(); // portal-এর home আর appointments-এ নতুন booking দেখাবে

		// client-এ শুধু যেটুকু লাগে (allergy, license ইত্যাদি না)
		return {
			success: true,
			message: response.message,
			data: {
				checkoutUrl,
				appointment: {
					id: appointment.id,
					appointmentNumber: appointment.appointmentNumber,
					status: appointment.status,
					startAt: appointment.startAt,
					paymentMode: appointment.paymentMode,
					feeCents: appointment.feeCents,
					patientName: appointment.patient.fullName,
					email: appointment.patient.user.email,
				},
			},
		};
	} catch (error) {
		return toMyBookingError(error);
	}
}

const ALTERNATIVE_COUNT = 3;

// slot হাতছাড়া হলে: একই doctor-এর কাছাকাছি খালি সময় (আগে ওই সময়ের পরেরগুলো, তারপর সবচেয়ে আগেরগুলো)
export async function findAlternativeSlotsAction(
	doctorId: unknown,
	afterStartAt: unknown,
): Promise<ActionResult<BookingSlot[]>> {
	const parsedId = doctorIdSchema.safeParse(doctorId);
	if (!parsedId.success) return { success: false, message: "Invalid doctor." };

	try {
		const response = await SlotService.getPublicSlots(parsedId.data);
		const open = response.data.days
			.flatMap((day) => day.slots)
			.filter((slot) => slot.status === "AVAILABLE")
			.map(({ id, startAt, endAt }) => ({ id, startAt, endAt }));

		const after = typeof afterStartAt === "string" ? open.filter((slot) => slot.startAt > afterStartAt) : [];
		const picked = [...after, ...open.filter((slot) => !after.includes(slot))].slice(0, ALTERNATIVE_COUNT);
		return { success: true, message: "OK", data: picked };
	} catch (error) {
		return toActionError(error);
	}
}
