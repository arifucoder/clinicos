import { envVars } from "@/app/config/env";
import { AppError } from "@/app/errorHelpers/AppError";
import { prisma } from "@/app/lib/prisma";
import { sendEmail } from "@/app/shared/sendEmail";
import { Role } from "@/generated/prisma/enums";
import { hashPassword } from "better-auth/crypto";
import httpStatus from "http-status";
import { randomBytes } from "node:crypto";
import type { TCreateAdminPayload, TCreateDoctorPayload } from "./user.interface";

const userSelect = {
	id: true,
	name: true,
	email: true,
	phone: true,
	role: true,
	isActive: true,
	needPasswordChange: true,
	createdAt: true,
} as const;

const doctorProfileSelect = {
	id: true,
	licenseNumber: true,
	consultationFeeCents: true,
	roomNumber: true,
	bio: true,
	photoUrl: true,
	doctorSpecialties: {
		select: { specialty: { select: { id: true, name: true, slug: true } } },
	},
} as const;

const createAdmin = async (payload: TCreateAdminPayload) => {
	const { name, email, phone } = payload;

	const existingUser = await prisma.user.findUnique({
		where: { email },
		select: { id: true },
	});

	if (existingUser) {
		throw new AppError(httpStatus.CONFLICT, "An account with this email already exists");
	}

	const temporaryPassword = randomBytes(9).toString("base64url");
	const hashedPassword = await hashPassword(temporaryPassword);
	const userId = crypto.randomUUID();

	const user = await prisma.$transaction(async (tx) => {
		const createdUser = await tx.user.create({
			data: {
				id: userId,
				name,
				email,
				phone: phone ?? null,
				role: Role.ADMIN,
				emailVerified: true,
				needPasswordChange: true,
			},
			select: userSelect,
		});

		await tx.account.create({
			data: {
				id: crypto.randomUUID(),
				userId,
				accountId: userId,
				providerId: "credential",
				password: hashedPassword,
			},
		});

		return createdUser;
	});

	let emailSent = true;

	try {
		await sendEmail({
			to: email,
			subject: `Your ${envVars.CLINIC_NAME} admin account`,
			previewText: "Your account is ready. Sign in with the temporary password inside.",
			template: "staffWelcome",
			data: {
				name,
				roleLabel: "Admin",
				email,
				temporaryPassword,
				loginUrl: `${envVars.FRONTEND_URL}/login`,
			},
		});
	} catch (error) {
		console.error(`Failed to send welcome email to user ${user.id}`, error);
		emailSent = false;
	}

	return { user, emailSent };
};

const createDoctor = async (payload: TCreateDoctorPayload) => {
	const { name, email, phone, specialtyIds, licenseNumber, consultationFeeCents, roomNumber, bio } = payload;

	const existingUser = await prisma.user.findUnique({
		where: { email },
		select: { id: true },
	});

	if (existingUser) {
		throw new AppError(httpStatus.CONFLICT, "An account with this email already exists");
	}

	const validSpecialtyCount = await prisma.specialty.count({
		where: { id: { in: specialtyIds }, isDeleted: false, isActive: true },
	});

	if (validSpecialtyCount !== specialtyIds.length) {
		throw new AppError(httpStatus.BAD_REQUEST, "One or more specialties are not found or inactive");
	}

	const licenseTaken = await prisma.doctorProfile.findUnique({
		where: { licenseNumber },
		select: { id: true },
	});

	if (licenseTaken) {
		throw new AppError(httpStatus.CONFLICT, "A doctor with this license number already exists");
	}

	const temporaryPassword = randomBytes(9).toString("base64url");
	const hashedPassword = await hashPassword(temporaryPassword);
	const userId = crypto.randomUUID();

	const { user, doctorProfile } = await prisma.$transaction(async (tx) => {
		const createdUser = await tx.user.create({
			data: {
				id: userId,
				name,
				email,
				phone: phone ?? null,
				role: Role.DOCTOR,
				emailVerified: true,
				needPasswordChange: true,
			},
			select: userSelect,
		});

		await tx.account.create({
			data: {
				id: crypto.randomUUID(),
				userId,
				accountId: userId,
				providerId: "credential",
				password: hashedPassword,
			},
		});

		const createdProfile = await tx.doctorProfile.create({
			data: {
				userId,
				licenseNumber,
				consultationFeeCents,
				roomNumber: roomNumber ?? null,
				bio: bio ?? null,
				doctorSpecialties: {
					createMany: {
						data: specialtyIds.map((specialtyId) => ({ specialtyId })),
					},
				},
			},
			select: doctorProfileSelect,
		});

		return { user: createdUser, doctorProfile: createdProfile };
	});

	let emailSent = true;

	try {
		await sendEmail({
			to: email,
			subject: `Your ${envVars.CLINIC_NAME} doctor account`,
			previewText: "Your account is ready. Sign in with the temporary password inside.",
			template: "staffWelcome",
			data: {
				name,
				roleLabel: "Doctor",
				email,
				temporaryPassword,
				loginUrl: `${envVars.FRONTEND_URL}/login`,
			},
		});
	} catch (error) {
		console.error(`Failed to send welcome email to user ${user.id}`, error);
		emailSent = false;
	}

	const { doctorSpecialties, ...profile } = doctorProfile;

	return {
		user,
		doctorProfile: {
			...profile,
			specialties: doctorSpecialties.map(({ specialty }) => specialty),
		},
		emailSent,
	};
};

export const UserService = {
	createAdmin,
	createDoctor,
};
