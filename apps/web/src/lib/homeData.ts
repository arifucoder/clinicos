import "server-only";

import { getBookingWindow } from "@/lib/findDoctor";
import { DoctorService } from "@/services/doctor.service";
import { SpecialtyService } from "@/services/specialty.service";
import { connection } from "next/server";
import { cache } from "react";

// home page-এর কয়েকটা section একই data চায় → cache(): একই request-এ api call একবার।
// সব public data (auth: false)। প্রতিটা section নিজের Suspense-এ, তাই api ধীর হলে বাকি page আটকায় না।

// connection(): axios ভেতরে Date.now() ডাকে → prerender-এ চালালে "unstable value" error (find-doctor page-এর মতো)
export const getHomeSpecialties = cache(async () => {
	await connection();
	const response = await SpecialtyService.getPublicSpecialties();
	return response.data;
});

// আজ যাদের খালি slot আছে (api নিজে ১ ঘণ্টার কম দূরের slot বাদ দেয়)
export const getDoctorsToday = cache(async () => {
	await connection(); // "আজ" প্রতি request-এ নতুন (prerender না)
	const { today } = getBookingWindow(new Date());
	const response = await DoctorService.getPublicDoctors({ page: 1, sort: "name", date: today });
	return { today, doctors: response.data, total: response.meta?.total ?? response.data.length };
});

// মোট active doctor (তারিখ ছাড়া)
export const getDoctorTotal = cache(async () => {
	await connection();
	const response = await DoctorService.getPublicDoctors({ page: 1, sort: "name" });
	return response.meta?.total ?? response.data.length;
});
