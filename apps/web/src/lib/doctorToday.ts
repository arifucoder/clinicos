import type { AppointmentStatus } from "@/types/appointment.types";
import type { DoctorStats } from "@/types/stats.types";
import type { DoctorTodayTab } from "@/zod/appointment.validation";

interface DoctorTabConfig {
	label: string;
	statuses: AppointmentStatus[]; // api-র status filter (op: "in")
	sortOrder: "asc" | "desc";
	emptyTitle: string;
	emptyDescription: string;
}

export const DOCTOR_TAB_CONFIG: Record<DoctorTodayTab, DoctorTabConfig> = {
	waiting: {
		label: "Waiting",
		statuses: ["CHECKED_IN"],
		sortOrder: "asc",
		emptyTitle: "No one is waiting right now",
		emptyDescription: "Patients appear here as soon as they check in.",
	},
	"not-arrived": {
		label: "Not arrived",
		statuses: ["CONFIRMED"],
		sortOrder: "asc",
		emptyTitle: "Everyone has arrived",
		emptyDescription: "No more confirmed appointments are waiting for check-in today.",
	},
	completed: {
		label: "Completed",
		statuses: ["COMPLETED"],
		sortOrder: "desc",
		emptyTitle: "No completed consultations yet",
		emptyDescription: "Completed patients move here from the Waiting tab.",
	},
};

export const doctorTabCounts = (today: DoctorStats["today"]): Record<DoctorTodayTab, number> => ({
	waiting: today.waiting,
	"not-arrived": today.notArrived,
	completed: today.completed,
});
