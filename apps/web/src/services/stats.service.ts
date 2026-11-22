import "server-only";

import { httpClient } from "@/lib/axios/httpClient";
import type { AdminStats } from "@/types/stats.types";

const getAdminStats = (days: number) => httpClient.get<AdminStats>("/stats/admin", { params: { days } });

export const StatsService = { getAdminStats };
