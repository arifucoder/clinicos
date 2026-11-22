import "server-only";

import { httpClient } from "@/lib/axios/httpClient";
import type { AdminStats, DoctorStats } from "@/types/stats.types";

const getAdminStats = (days: number) => httpClient.get<AdminStats>("/stats/admin", { params: { days } });

// doctor কে, সেটা api session থেকে বের করে → কোনো id পাঠাই না
const getDoctorStats = () => httpClient.get<DoctorStats>("/stats/doctor");

export const StatsService = { getAdminStats, getDoctorStats };
