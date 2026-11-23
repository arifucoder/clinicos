import { addDays, clinicToday } from "@/lib/clinicDate";
import type { DoctorSortKey, PublicDoctorListQuery } from "@/zod/doctor.validation";

export const FIND_DOCTOR_PATH = "/doctors";

// api-র SLOT_CONFIG.bookingWindowDays-এর সাথে মিল রাখো (আজ + ১৩ দিন)
export const BOOKING_WINDOW_DAYS = 14;
export const DOCTOR_PAGE_SIZE = 10;

// URL-এ ছোট নাম (sort=fee-asc), api-তে যায় আসল field
export const DOCTOR_SORTS: Record<DoctorSortKey, { label: string; sortBy: string; sortOrder: "asc" | "desc" }> = {
	name: { label: "Name (A–Z)", sortBy: "user.name", sortOrder: "asc" },
	"fee-asc": { label: "Fee: low to high", sortBy: "consultationFeeCents", sortOrder: "asc" },
	"fee-desc": { label: "Fee: high to low", sortBy: "consultationFeeCents", sortOrder: "desc" },
};

export interface BookingWindow {
	today: string;
	tomorrow: string;
	lastDate: string;
}

export const getBookingWindow = (now: Date): BookingWindow => {
	const today = clinicToday(now);
	return { today, tomorrow: addDays(today, 1), lastDate: addDays(today, BOOKING_WINDOW_DAYS - 1) };
};

// পুরনো bookmark-এর তারিখ (অতীত বা ১৪ দিনের বাইরে) বাদ দিই — না হলে api 400 দিত আর page ভেঙে যেত
export const clampToWindow = (date: string | undefined, window: BookingWindow) =>
	date && date >= window.today && date <= window.lastDate ? date : undefined;

// server component-এর Link-এর জন্য (pagination, empty state)। default value URL-এ রাখি না
export const buildDoctorsHref = (query: PublicDoctorListQuery, patch: Partial<PublicDoctorListQuery> = {}) => {
	const next = { ...query, ...patch };
	const params = new URLSearchParams();

	if (next.searchTerm) params.set("searchTerm", next.searchTerm);
	if (next.specialty) params.set("specialty", next.specialty);
	if (next.date) params.set("date", next.date);
	if (next.sort !== "name") params.set("sort", next.sort);
	if (next.page > 1) params.set("page", String(next.page));

	const search = params.toString();
	return search ? `${FIND_DOCTOR_PATH}?${search}` : FIND_DOCTOR_PATH;
};
