import "server-only";

import { httpClient } from "@/lib/axios/httpClient";
import type { AdminStats, DoctorStats, PatientStats } from "@/types/stats.types";

const getAdminStats = (days: number) => httpClient.get<AdminStats>("/stats/admin", { params: { days } });

// doctor কে, সেটা api session থেকে বের করে → কোনো id পাঠাই না
const getDoctorStats = () => httpClient.get<DoctorStats>("/stats/doctor");

// patient portal: রোগী কে, api session থেকে বের করে → কোনো id পাঠাই না (IDOR-safe)
const getPatientStats = () => httpClient.get<PatientStats>("/patient/stats");

export const StatsService = { getAdminStats, getDoctorStats, getPatientStats };
