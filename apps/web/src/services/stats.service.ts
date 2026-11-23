import "server-only";

import { httpClient } from "@/lib/axios/httpClient";
import type { AdminStats, DoctorStats, PatientStats } from "@/types/stats.types";

const getAdminStats = (days: number) => httpClient.get<AdminStats>("/stats/admin", { params: { days } });

const getDoctorStats = () => httpClient.get<DoctorStats>("/stats/doctor");

const getPatientStats = () => httpClient.get<PatientStats>("/patient/stats");

export const StatsService = { getAdminStats, getDoctorStats, getPatientStats };
