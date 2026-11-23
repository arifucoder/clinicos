import "server-only";

import { getBookingWindow } from "@/lib/findDoctor";
import { DoctorService } from "@/services/doctor.service";
import { SpecialtyService } from "@/services/specialty.service";
import { connection } from "next/server";
import { cache } from "react";

export const getHomeSpecialties = cache(async () => {
	await connection();
	const response = await SpecialtyService.getPublicSpecialties();
	return response.data;
});

export const getDoctorsToday = cache(async () => {
	await connection(); // "আজ" প্রতি request-এ নতুন (prerender না)
	const { today } = getBookingWindow(new Date());
	const response = await DoctorService.getPublicDoctors({ page: 1, sort: "name", date: today, show: "open" });
	return { today, doctors: response.data, total: response.meta?.total ?? response.data.length };
});

export const getDoctorTotal = cache(async () => {
	await connection();
	const response = await DoctorService.getPublicDoctors({ page: 1, sort: "name", show: "all" }, 1);
	return response.meta?.total ?? response.data.length;
});
