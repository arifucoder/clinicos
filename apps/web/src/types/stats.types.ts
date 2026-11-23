import type { AppointmentStatus } from "@/types/appointment.types";

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

export interface DoctorStats {
	today: {
		date: string;
		waiting: number; // CHECKED_IN
		notArrived: number; // CONFIRMED
		completed: number;
		noShow: number;
	};
	nextAppointment: {
		id: string;
		appointmentNumber: string;
		startAt: string;
		status: AppointmentStatus;
		patient: { fullName: string; allergies: string | null };
	} | null;
	thisMonth: {
		from: string;
		completed: number;
		noShow: number;
		patientsSeen: number; // আলাদা রোগী (একজন দুবার এলেও ১)
	};
	last7Days: { day: string; completed: number }[];
}

export interface PatientStats {
	nextAppointment: {
		id: string;
		appointmentNumber: string;
		startAt: string;
		status: AppointmentStatus; // PENDING_PAYMENT (hold চালু) | CONFIRMED | CHECKED_IN
		holdExpiresAt: string | null;
		doctor: { roomNumber: string | null; user: { name: string } };
		isPaid: boolean;
	} | null;
	upcomingCount: number;
	pendingPaymentCount: number;
	completedCount: number;
	lastVisit: {
		id: string;
		startAt: string;
		doctor: { user: { name: string } };
		prescription: { diagnosis: string | null; followUpDate: string | null } | null; // followUpDate: @db.Date
	} | null;
	totalPaidCents: number;
}
