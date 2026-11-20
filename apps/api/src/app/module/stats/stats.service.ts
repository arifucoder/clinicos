import { envVars } from "@/app/config/env";
import { AppError } from "@/app/errorHelpers/AppError";
import { prisma } from "@/app/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { AppointmentSource, AppointmentStatus, PaymentStatus } from "@/generated/prisma/enums";
import httpStatus from "http-status";
import { clinicDayRange } from "../appointment/appointment.helpers";
import { addDaysToDate, clinicDateOf, clinicDayStartUtc } from "../slot/slot.utils";

const TZ = envVars.CLINIC_TIME_ZONE;

// ---------------- ছোট helper ----------------

// "2026-11-07" থেকে n দিনের তালিকা: ["2026-11-07", "2026-11-08", …]
const dayList = (fromDate: string, days: number): string[] =>
	Array.from({ length: days }, (_, index) => addDaysToDate(fromDate, index));

// কোন status কতবার এসেছে: { CONFIRMED: 3, COMPLETED: 5, … } (যেটা নেই সেটা 0)
const countByStatus = (rows: { status: AppointmentStatus }[]) => {
	const counts: Record<AppointmentStatus, number> = {
		PENDING_PAYMENT: 0,
		CONFIRMED: 0,
		CHECKED_IN: 0,
		COMPLETED: 0,
		CANCELLED: 0,
		NO_SHOW: 0,
		EXPIRED: 0,
	};
	for (const row of rows) counts[row.status] += 1;
	return counts;
};

// টাকার যোগফল
const sumCents = (rows: { amountCents: number }[]) => rows.reduce((total, row) => total + row.amountCents, 0);

// ---------------- Admin ----------------

const getAdminStats = async (days: number) => {
	const today = clinicDateOf(new Date(), TZ);
	const fromDate = addDaysToDate(today, -(days - 1));
	const range = { gte: clinicDayStartUtc(fromDate, TZ), lt: clinicDayRange(today).lt };

	// শুধু দরকারি column আনি, তারপর JS-এ গুনি (clinic-এর আকারে কয়েক হাজার row — সমস্যা নেই)
	const [appointments, payments, doctors, newPatients] = await Promise.all([
		prisma.appointment.findMany({
			// EXPIRED = pay না করা hold, আসলে booking হয়নি → বাদ
			where: { startAt: range, status: { not: AppointmentStatus.EXPIRED } },
			select: { startAt: true, status: true, source: true, doctorId: true },
		}),
		prisma.payment.findMany({
			// আদায় = শুধু সফল payment (refund হলে status REFUNDED, তাই নিজে থেকেই বাদ)
			where: { status: PaymentStatus.SUCCEEDED, paidAt: range },
			select: { paidAt: true, amountCents: true },
		}),
		prisma.doctorProfile.findMany({
			where: { user: { isDeleted: false } },
			select: { id: true, user: { select: { name: true } } },
		}),
		prisma.patient.count({ where: { createdAt: range } }),
	]);

	// প্রতিটা row-এর গায়ে clinic-এর তারিখ ("2026-11-20") বসাই — timezone-এর কাজ এখানেই শেষ
	const appointmentDays = appointments.map((appointment) => ({
		...appointment,
		day: clinicDateOf(appointment.startAt, TZ),
	}));
	const paymentDays = payments.map((payment) => ({
		amountCents: payment.amountCents,
		day: payment.paidAt ? clinicDateOf(payment.paidAt, TZ) : "",
	}));

	const todayAppointments = appointmentDays.filter((appointment) => appointment.day === today);
	const todayPayments = paymentDays.filter((payment) => payment.day === today);

	// Chart: প্রতিদিন একটা row (যে দিনে কিছু নেই সেখানে 0)
	const daily = dayList(fromDate, days).map((day) => {
		const dayAppointments = appointmentDays.filter((appointment) => appointment.day === day);
		return {
			day,
			total: dayAppointments.length,
			completed: dayAppointments.filter((appointment) => appointment.status === AppointmentStatus.COMPLETED).length,
			collectedCents: sumCents(paymentDays.filter((payment) => payment.day === day)),
		};
	});

	// Doctor অনুযায়ী (যার এই সময়ে কোনো appointment নেই সে বাদ)
	const byDoctor = doctors
		.map((doctor) => {
			const counts = countByStatus(appointments.filter((appointment) => appointment.doctorId === doctor.id));
			return {
				doctorId: doctor.id,
				name: doctor.user.name,
				total: Object.values(counts).reduce((total, count) => total + count, 0),
				completed: counts.COMPLETED,
				noShow: counts.NO_SHOW,
				cancelled: counts.CANCELLED,
			};
		})
		.filter((doctor) => doctor.total > 0)
		.toSorted((a, b) => b.completed - a.completed);

	return {
		range: { from: fromDate, to: today, days },
		today: {
			date: today,
			byStatus: countByStatus(todayAppointments),
			collectedCents: sumCents(todayPayments),
		},
		totals: {
			collectedCents: sumCents(payments),
			newPatients,
			onlineBookings: appointments.filter((appointment) => appointment.source === AppointmentSource.ONLINE).length,
			frontDeskBookings: appointments.filter((appointment) => appointment.source === AppointmentSource.STAFF).length,
		},
		daily,
		byDoctor,
	};
};

// ---------------- Doctor (শুধু নিজের) ----------------

const getDoctorStats = async (userId: string) => {
	const doctor = await prisma.doctorProfile.findUnique({ where: { userId }, select: { id: true } });
	if (!doctor) throw new AppError(httpStatus.NOT_FOUND, "Doctor profile not found");
	const doctorId = doctor.id;

	const now = new Date();
	const today = clinicDateOf(now, TZ);
	const weekFrom = addDaysToDate(today, -6); // গত ৭ দিন (আজ সহ)
	const monthFrom = `${today.slice(0, 7)}-01`; // এই মাসের ১ তারিখ
	const fetchFrom = weekFrom < monthFrom ? weekFrom : monthFrom; // দুটোর যেটা আগে, সেখান থেকে আনি

	const [appointments, nextAppointment] = await Promise.all([
		prisma.appointment.findMany({
			where: {
				doctorId,
				startAt: { gte: clinicDayStartUtc(fetchFrom, TZ), lt: clinicDayRange(today).lt },
			},
			select: { startAt: true, status: true, patientId: true },
		}),
		// পরের রোগী: আজ এসে অপেক্ষা করছে এমন কেউ, নাহলে সামনের confirmed appointment
		prisma.appointment.findFirst({
			where: {
				doctorId,
				OR: [
					{ status: AppointmentStatus.CHECKED_IN, startAt: clinicDayRange(today) },
					{ status: AppointmentStatus.CONFIRMED, endAt: { gt: now } },
				],
			},
			orderBy: { startAt: "asc" },
			select: {
				id: true,
				appointmentNumber: true,
				startAt: true,
				status: true,
				patient: { select: { fullName: true, allergies: true } },
			},
		}),
	]);

	const withDay = appointments.map((appointment) => ({ ...appointment, day: clinicDateOf(appointment.startAt, TZ) }));
	const todayCounts = countByStatus(withDay.filter((appointment) => appointment.day === today));
	const monthRows = withDay.filter((appointment) => appointment.day >= monthFrom);
	const monthCounts = countByStatus(monthRows);
	const completedRows = withDay.filter((appointment) => appointment.status === AppointmentStatus.COMPLETED);

	// এই মাসে কতজন আলাদা রোগী দেখেছেন (একই রোগী দুবার এলে একবার) — Set নিজেই duplicate বাদ দেয়
	const patientsSeen = new Set(
		completedRows.filter((appointment) => appointment.day >= monthFrom).map((appointment) => appointment.patientId),
	).size;

	return {
		today: {
			date: today,
			waiting: todayCounts.CHECKED_IN, // এসে অপেক্ষা করছেন
			notArrived: todayCounts.CONFIRMED, // এখনো আসেননি
			completed: todayCounts.COMPLETED,
			noShow: todayCounts.NO_SHOW,
		},
		nextAppointment,
		thisMonth: {
			from: monthFrom,
			completed: monthCounts.COMPLETED,
			noShow: monthCounts.NO_SHOW,
			patientsSeen,
		},
		last7Days: dayList(weekFrom, 7).map((day) => ({
			day,
			completed: completedRows.filter((appointment) => appointment.day === day).length,
		})),
	};
};

// ---------------- Patient (শুধু নিজের; patientId session থেকে) ----------------

const getPatientStats = async (userId: string) => {
	const patient = await prisma.patient.findFirst({
		where: { userId, user: { isDeleted: false } },
		select: { id: true },
	});
	if (!patient) throw new AppError(httpStatus.NOT_FOUND, "Patient profile not found");
	const patientId = patient.id;
	const now = new Date();

	// সামনের appointment: confirmed/checked-in যার সময় শেষ হয়নি, অথবা pay-এর hold এখনো চলছে
	const upcomingWhere: Prisma.AppointmentWhereInput = {
		patientId,
		OR: [
			{ status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.CHECKED_IN] }, endAt: { gt: now } },
			{ status: AppointmentStatus.PENDING_PAYMENT, holdExpiresAt: { gt: now } },
		],
	};

	const [nextAppointment, upcomingCount, pendingPaymentCount, completedCount, lastVisit, payments] = await Promise.all([
		prisma.appointment.findFirst({
			where: upcomingWhere,
			orderBy: { startAt: "asc" },
			select: {
				id: true,
				appointmentNumber: true,
				startAt: true,
				status: true,
				holdExpiresAt: true,
				doctor: { select: { roomNumber: true, user: { select: { name: true } } } },
				payments: { where: { status: PaymentStatus.SUCCEEDED }, select: { id: true } },
			},
		}),
		prisma.appointment.count({ where: upcomingWhere }),
		prisma.appointment.count({
			where: { patientId, status: AppointmentStatus.PENDING_PAYMENT, holdExpiresAt: { gt: now } },
		}),
		prisma.appointment.count({ where: { patientId, status: AppointmentStatus.COMPLETED } }),
		prisma.appointment.findFirst({
			where: { patientId, status: AppointmentStatus.COMPLETED },
			orderBy: { startAt: "desc" },
			select: {
				id: true,
				startAt: true,
				doctor: { select: { user: { select: { name: true } } } },
				prescription: { select: { diagnosis: true, followUpDate: true } },
			},
		}),
		prisma.payment.findMany({
			where: { status: PaymentStatus.SUCCEEDED, appointment: { patientId } },
			select: { amountCents: true },
		}),
	]);

	return {
		nextAppointment: nextAppointment
			? {
					id: nextAppointment.id,
					appointmentNumber: nextAppointment.appointmentNumber,
					startAt: nextAppointment.startAt,
					status: nextAppointment.status,
					holdExpiresAt: nextAppointment.holdExpiresAt,
					doctor: nextAppointment.doctor,
					isPaid: nextAppointment.payments.length > 0,
				}
			: null,
		upcomingCount,
		pendingPaymentCount,
		completedCount,
		lastVisit,
		totalPaidCents: sumCents(payments),
	};
};

export const StatsService = { getAdminStats, getDoctorStats, getPatientStats };
