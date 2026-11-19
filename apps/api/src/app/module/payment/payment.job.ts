import { schedule, type ScheduledTask } from "node-cron";
import { PaymentService } from "./payment.service";

// প্রতি মিনিটে: hold শেষ হওয়া PENDING_PAYMENT → EXPIRED
export const startPaymentJobs = (): ScheduledTask[] => [
	schedule(
		"* * * * *",
		async () => {
			try {
				const expired = await PaymentService.expireUnpaidHolds();
				if (expired > 0) console.info(`[cron] expired ${expired} unpaid booking hold(s)`);
			} catch (error) {
				console.error("[cron] expire unpaid holds failed:", error instanceof Error ? error.message : error);
			}
		},
		{ name: "expire-unpaid-holds", noOverlap: true }, // আগের run শেষ না হলে নতুন run শুরু হয় না
	),
];
