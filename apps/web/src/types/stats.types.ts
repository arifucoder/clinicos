import type { AppointmentStatus } from "@/types/appointment.types";

// api-র StatsService.getAdminStats-এর return (stats.service.ts)। তারিখগুলো "YYYY-MM-DD" (clinic-এর দিন)।
export interface DailyStat {
	day: string;
	total: number;
	completed: number;
	collectedCents: number;
}

export interface DoctorStat {
	doctorId: string;
	name: string;
	total: number;
	completed: number;
	noShow: number;
	cancelled: number;
}

export interface AdminStats {
	range: { from: string; to: string; days: number };
	today: {
		date: string;
		byStatus: Record<AppointmentStatus, number>;
		collectedCents: number;
	};
	totals: {
		collectedCents: number;
		newPatients: number;
		onlineBookings: number;
		frontDeskBookings: number;
	};
	daily: DailyStat[];
	byDoctor: DoctorStat[];
}
