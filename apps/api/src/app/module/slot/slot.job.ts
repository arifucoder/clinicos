import { schedule, type ScheduledTask } from "node-cron";
import { envVars } from "@/app/config/env";
import { refillDoctorSlots } from "./slot.refill";

export const startSlotJobs = (): ScheduledTask[] => [
	schedule(
		"0 2 * * *",
		async () => {
			try {
				const created = await refillDoctorSlots();
				if (created > 0) console.info(`[cron] added ${created} new doctor slot(s)`);
			} catch (error) {
				console.error("[cron] slot refill failed:", error instanceof Error ? error.message : error);
			}
		},
		{ name: "refill-doctor-slots", noOverlap: true, timezone: envVars.CLINIC_TIME_ZONE },
	),
];
