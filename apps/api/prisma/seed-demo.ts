import { TZDate } from "@date-fns/tz";
import { addDays, addMinutes } from "date-fns";
import { hashPassword } from "better-auth/crypto";
import { envVars } from "@/app/config/env";
import { prisma } from "@/app/lib/prisma";
import { refillDoctorSlots } from "@/app/module/slot/slot.refill";
import {
	AppointmentPaymentMode,
	AppointmentSource,
	AppointmentStatus,
	BloodGroup,
	Gender,
	PaymentMethod,
	PaymentProvider,
	PaymentStatus,
	Role,
} from "@/generated/prisma/enums";

// Demo data only — never run against production.
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "Demo@1234";
const DOCTORS_WITH_SLOTS = 15;
const TZ = envVars.CLINIC_TIME_ZONE;

const SPECIALTIES = [
	{ name: "General Medicine", slug: "general-medicine" },
	{ name: "Cardiology", slug: "cardiology" },
	{ name: "Pediatrics", slug: "pediatrics" },
	{ name: "Dermatology", slug: "dermatology" },
	{ name: "Orthopedics", slug: "orthopedics" },
	{ name: "Neurology", slug: "neurology" },
	{ name: "ENT", slug: "ent" },
];

const DOCTOR_NAMES = [
	"Ayesha Rahman", "Tanvir Hasan", "Nusrat Jahan", "Imran Chowdhury", "Farhana Akter", "Rafiq Islam", "Sadia Karim",
	"Mahmudul Haque", "Nadia Sultana", "Kamrul Ahsan", "Shirin Akhter", "Zahid Hossain", "Rumana Begum", "Arif Mahmud",
	"Tasnim Ferdous", "Habib Ullah", "Lamia Noor", "Sohel Rana", "Mehnaz Kabir", "Fahim Shahriar", "Jannatul Mawa",
];

const PATIENT_NAMES = [
	"Rahim Uddin", "Karima Khatun", "Sabbir Ahmed", "Mitu Das", "Jamal Hossain", "Rina Parvin",
	"Asif Iqbal", "Shampa Roy", "Nayeem Khan", "Taslima Nasrin", "Biplob Sarkar", "Moumita Saha",
];

const BLOOD_GROUPS = Object.values(BloodGroup);
const slugify = (name: string) => name.toLowerCase().replace(/[^a-z]+/g, ".");

/** Creates a user + credential account once; returns the existing id on re-runs. */
const ensureUser = async (email: string, name: string, role: Role, hashedPassword: string, phone: string) => {
	const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
	if (existing) return existing.id;

	const id = crypto.randomUUID();
	await prisma.$transaction([
		prisma.user.create({ data: { id, name, email, role, phone, emailVerified: true } }),
		prisma.account.create({
			data: { id: crypto.randomUUID(), userId: id, accountId: id, providerId: "credential", password: hashedPassword },
		}),
	]);
	return id;
};

/** A wall-clock time in the clinic's time zone, `dayOffset` days from today, as a UTC Date. */
const clinicTime = (dayOffset: number, hour: number) => {
	const day = addDays(new TZDate(Date.now(), TZ), dayOffset);
	return new Date(new TZDate(day.getFullYear(), day.getMonth(), day.getDate(), hour, 0, TZ).getTime());
};

const seedSpecialties = async () =>
	Promise.all(
		SPECIALTIES.map((s) => prisma.specialty.upsert({ where: { slug: s.slug }, create: s, update: {}, select: { id: true } })),
	);

const seedDoctors = async (hashedPassword: string, specialtyIds: string[]) => {
	const doctorIds: string[] = [];
	for (const [i, name] of DOCTOR_NAMES.entries()) {
		const n = String(i + 1).padStart(2, "0");
		const userId = await ensureUser(`dr.${slugify(name)}@clinicos.dev`, `Dr. ${name}`, Role.DOCTOR, hashedPassword, `+8801700000${n}`);
		const profile = await prisma.doctorProfile.upsert({
			where: { userId },
			create: {
				userId,
				licenseNumber: `BMDC-DEMO-${n}`,
				consultationFeeCents: 2000 + (i % 5) * 500,
				roomNumber: `${100 + i + 1}`,
				slotMinutesDefault: i % 3 === 0 ? 20 : 15,
				bio: `Dr. ${name} has over ${5 + (i % 12)} years of clinical experience.`,
				doctorSpecialties: { create: [{ specialtyId: specialtyIds[i % specialtyIds.length]! }] },
			},
			update: {},
			select: { id: true },
		});
		doctorIds.push(profile.id);
	}
	return doctorIds;
};

const seedPatients = async (hashedPassword: string) => {
	const patients: { id: string; userId: string }[] = [];
	for (const [i, fullName] of PATIENT_NAMES.entries()) {
		const n = String(i + 1).padStart(2, "0");
		const phone = `+8801800000${n}`;
		const userId = await ensureUser(`${slugify(fullName)}@patient.dev`, fullName, Role.PATIENT, hashedPassword, phone);
		const patient = await prisma.patient.upsert({
			where: { userId },
			create: {
				userId,
				fullName,
				phone,
				dateOfBirth: new Date(Date.UTC(1975 + i * 3, i % 12, 10 + i)),
				gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
				bloodGroup: BLOOD_GROUPS[i % BLOOD_GROUPS.length],
				allergies: i % 4 === 0 ? "Penicillin" : null,
				address: "Dhaka, Bangladesh",
			},
			update: {},
			select: { id: true, userId: true },
		});
		patients.push(patient);
	}
	return patients;
};

/** Patient #1: one completed visit (paid + prescription) last week, one confirmed upcoming booking. */
const seedPatientHistory = async (patient: { id: string; userId: string }, doctorId: string) => {
	const already = await prisma.appointment.count({ where: { patientId: patient.id } });
	if (already > 0) return console.warn("Demo appointments already exist, skipping");

	const superAdmin = await prisma.user.findFirstOrThrow({ where: { role: Role.SUPER_ADMIN }, select: { id: true } });
	const doctor = await prisma.doctorProfile.findUniqueOrThrow({
		where: { id: doctorId },
		select: { consultationFeeCents: true, slotMinutesDefault: true },
	});

	// Past visit: a slot 7 days ago (the refill job only creates future slots, so we make this one by hand).
	const pastStart = clinicTime(-7, 10);
	const pastEnd = addMinutes(pastStart, doctor.slotMinutesDefault);
	const pastSlot = await prisma.doctorSlot.upsert({
		where: { doctorId_startAt: { doctorId, startAt: pastStart } },
		create: { doctorId, startAt: pastStart, endAt: pastEnd, createdById: superAdmin.id },
		update: {},
		select: { id: true },
	});

	await prisma.appointment.create({
		data: {
			appointmentNumber: "APT-DEMO-0001",
			patientId: patient.id,
			doctorId,
			slotId: pastSlot.id,
			startAt: pastStart,
			endAt: pastEnd,
			status: AppointmentStatus.COMPLETED,
			source: AppointmentSource.ONLINE,
			paymentMode: AppointmentPaymentMode.AT_DESK,
			feeCents: doctor.consultationFeeCents,
			reason: "Fever and sore throat for 3 days",
			bookedById: patient.userId,
			checkedInAt: addMinutes(pastStart, -10),
			checkedInById: superAdmin.id,
			completedAt: pastEnd,
			payments: {
				create: {
					provider: PaymentProvider.DESK,
					status: PaymentStatus.SUCCEEDED,
					amountCents: doctor.consultationFeeCents,
					deskMethod: PaymentMethod.CASH,
					receivedById: superAdmin.id,
					paidAt: addMinutes(pastStart, -10),
				},
			},
			prescription: {
				create: {
					symptoms: "Fever (101°F), sore throat, mild cough",
					diagnosis: "Acute pharyngitis",
					advice: "Warm saline gargle, plenty of fluids, rest for 3 days.",
					followUpDate: clinicTime(7, 0),
					items: {
						create: [
							{ medicineName: "Paracetamol 500mg", dosage: "1 tablet", frequency: "1+1+1", durationDays: 5, instructions: "After meals", sortOrder: 0 },
							{ medicineName: "Azithromycin 500mg", dosage: "1 tablet", frequency: "1+0+0", durationDays: 3, instructions: "Before breakfast", sortOrder: 1 },
						],
					},
				},
			},
		},
	});

	// Upcoming booking: first open slot from tomorrow onward.
	const nextSlot = await prisma.doctorSlot.findFirst({
		where: { doctorId, status: "OPEN", startAt: { gte: clinicTime(1, 0) }, appointments: { none: {} } },
		orderBy: { startAt: "asc" },
		select: { id: true, startAt: true, endAt: true },
	});
	if (!nextSlot) return console.warn("No future slot found for upcoming demo booking");

	await prisma.appointment.create({
		data: {
			appointmentNumber: "APT-DEMO-0002",
			patientId: patient.id,
			doctorId,
			slotId: nextSlot.id,
			startAt: nextSlot.startAt,
			endAt: nextSlot.endAt,
			status: AppointmentStatus.CONFIRMED,
			source: AppointmentSource.ONLINE,
			paymentMode: AppointmentPaymentMode.AT_DESK,
			feeCents: doctor.consultationFeeCents,
			reason: "Follow-up for pharyngitis",
			bookedById: patient.userId,
		},
	});
};

const seedDemo = async () => {
	if (envVars.NODE_ENV === "production" && process.env.ALLOW_DEMO_SEED !== "true") {
		throw new Error("Refusing to seed demo data in production (set ALLOW_DEMO_SEED=true for a demo server)");
	}

	const hashedPassword = await hashPassword(DEMO_PASSWORD);
	const specialties = await seedSpecialties();
	const doctorIds = await seedDoctors(hashedPassword, specialties.map((s) => s.id));
	const slotsCreated = await refillDoctorSlots(doctorIds.slice(0, DOCTORS_WITH_SLOTS));
	const patients = await seedPatients(hashedPassword);
	await seedPatientHistory(patients[0]!, doctorIds[0]!);

	console.warn(
		`Demo seed done: ${doctorIds.length} doctors (${DOCTORS_WITH_SLOTS} with slots, ${slotsCreated} new slots), ${patients.length} patients. Password: ${DEMO_PASSWORD}`,
	);
};

try {
	await seedDemo();
} catch (error) {
	console.error("Demo seed failed:", error);
	process.exitCode = 1;
} finally {
	await prisma.$disconnect();
}
