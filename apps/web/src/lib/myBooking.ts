import { clinicToday, formatClinicTime, formatDayLabel } from "@/lib/clinicDate";
import { PATIENT_BOOK_PATH } from "@/lib/doctorProfile";

// api-র APPOINTMENT_CONFIG-এর সাথে মিল রাখো
export const PATIENT_CANCEL_BEFORE_MINUTES = 120;
export const ONLINE_HOLD_MINUTES = 30;
export const MIN_ONLINE_AMOUNT_CENTS = 50;

export const REASON_CHIPS = ["Fever", "Follow-up", "Check-up", "Prescription refill"] as const;

export const MY_APPOINTMENTS_PATH = "/portal/appointments";
export const PROFILE_PATH = "/portal/profile";

export const bookingPageHref = (doctorId: string, slotId: string) =>
	`${PATIENT_BOOK_PATH}?doctorId=${doctorId}&slotId=${slotId}`;

// profile পূরণ করে ঠিক এই booking-এ ফেরা
export const profileHrefFor = (returnTo: string) => `${PROFILE_PATH}?next=${encodeURIComponent(returnTo)}`;

// "Tue 24 Nov · 18:30"
export const formatSlotLabel = (iso: string) => `${formatDayLabel(clinicToday(new Date(iso)))} · ${formatClinicTime(iso)}`;

// কখন পর্যন্ত online cancel করা যায়
export const cancelDeadline = (startAt: string) =>
	formatSlotLabel(new Date(Date.parse(startAt) - PATIENT_CANCEL_BEFORE_MINUTES * 60_000).toISOString());

// "Same day · 1 hour later" / "Next day" / "Thu 26 Nov"
export const describeAlternative = (startAt: string, reference?: string) => {
	if (!reference) return formatDayLabel(clinicToday(new Date(startAt)));
	const sameDay = clinicToday(new Date(startAt)) === clinicToday(new Date(reference));
	if (!sameDay) return "Another day";
	const minutes = Math.round((Date.parse(startAt) - Date.parse(reference)) / 60_000);
	if (minutes <= 0) return "Same day · earlier";
	if (minutes < 60) return `Same day · ${minutes} min later`;
	const hours = Math.round((minutes / 60) * 2) / 2;
	return `Same day · ${hours} ${hours === 1 ? "hour" : "hours"} later`;
};
