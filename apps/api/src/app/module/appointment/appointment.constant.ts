import { defineListConfig } from "@/app/shared/query/queryBuilder";
import type { Prisma } from "@/generated/prisma/client";
import { AppointmentPaymentMode, AppointmentSource, AppointmentStatus, PaymentStatus } from "@/generated/prisma/enums";

export const appointmentSelect = {
	id: true,
	appointmentNumber: true,
	startAt: true,
	endAt: true,
	status: true,
	source: true,
	paymentMode: true,
	feeCents: true,
	holdExpiresAt: true,
	reason: true,
	checkedInAt: true,
	completedAt: true,
	cancelledAt: true,
	cancelReason: true,
	createdAt: true,
	patient: {
		select: {
			id: true,
			fullName: true,
			phone: true,
			allergies: true,
			// consultation-এ doctor-এর বয়স/লিঙ্গ/রক্তের গ্রুপ লাগে (portal-এ রোগী নিজেরটাই দেখে)
			dateOfBirth: true,
			gender: true,
			bloodGroup: true,
			user: { select: { email: true } },
		},
	},
	doctor: {
		select: {
			id: true,
			roomNumber: true,
			// prescription-এর কাগজে doctor-এর license আর specialty দেখায়
			licenseNumber: true,
			user: { select: { name: true } },
			doctorSpecialties: {
				select: { specialty: { select: { name: true } } },
				orderBy: { specialty: { name: "asc" } },
			},
		},
	},
	payments: {
		select: {
			id: true,
			provider: true,
			status: true,
			amountCents: true,
			currency: true,
			deskMethod: true,
			paidAt: true,
			refundedAt: true,
			createdAt: true,
		},
		orderBy: { createdAt: "asc" },
	},
	prescription: {
		select: {
			symptoms: true,
			diagnosis: true,
			advice: true,
			followUpDate: true,
			updatedAt: true,
			items: {
				select: {
					medicineName: true,
					dosage: true,
					frequency: true,
					durationDays: true,
					instructions: true,
				},
				orderBy: { sortOrder: "asc" },
			},
		},
	},
} satisfies Prisma.AppointmentSelect;

export type TAppointmentRow = Prisma.AppointmentGetPayload<{ select: typeof appointmentSelect }>;

// doctorSpecialties-এর join table client-এ লুকাই → doctor.specialties: string[] (doctor module-এর মতো)
export const toAppointmentResponse = ({ doctor: { doctorSpecialties, ...doctor }, ...appointment }: TAppointmentRow) => ({
	...appointment,
	doctor: { ...doctor, specialties: doctorSpecialties.map(({ specialty }) => specialty.name) },
	isPaid: appointment.payments.some((payment) => payment.status === PaymentStatus.SUCCEEDED),
});

export const appointmentListConfig = defineListConfig<
	Prisma.AppointmentWhereInput,
	Prisma.AppointmentOrderByWithRelationInput
>({
	searchableFields: ["appointmentNumber", "patient.fullName", "patient.phone", "patient.user.email"],
	filters: {
		status: { path: "status", type: "enum", op: "in", values: Object.values(AppointmentStatus) },
		source: { path: "source", type: "enum", values: Object.values(AppointmentSource) },
		paymentMode: { path: "paymentMode", type: "enum", values: Object.values(AppointmentPaymentMode) },
		doctorId: { path: "doctorId", type: "uuid" },
		patientId: { path: "patientId", type: "uuid" },
	},
	sortableFields: ["startAt", "createdAt", "appointmentNumber"],
	defaultSortBy: "startAt",
	defaultSortOrder: "asc",
});
