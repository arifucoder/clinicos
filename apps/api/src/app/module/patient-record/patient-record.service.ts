import { envVars } from "@/app/config/env";
import { AppError } from "@/app/errorHelpers/AppError";
import { prisma } from "@/app/lib/prisma";
import { buildListQuery, buildMeta } from "@/app/shared/query/queryBuilder";
import { sendEmail } from "@/app/shared/sendEmail";
import type { Prisma } from "@/generated/prisma/client";
import { Role } from "@/generated/prisma/enums";
import { hashPassword } from "better-auth/crypto";
import httpStatus from "http-status";
import { randomBytes } from "node:crypto";
import { patientRecordListConfig } from "./patient-record.constant";
import type {
	TCreatePatientPayload,
	TUpdateAccountStatusPayload,
	TUpdatePatientPayload,
} from "./patient-record.interface";

const patientSelect = {
	id: true,
	fullName: true,
	phone: true,
	dateOfBirth: true,
	gender: true,
	address: true,
	bloodGroup: true,
	allergies: true,
	emergencyContactName: true,
	emergencyContactPhone: true,
	registeredById: true,
	createdAt: true,
	updatedAt: true,
	user: {
		select: { id: true, email: true, isActive: true, needPasswordChange: true },
	},
} satisfies Prisma.PatientSelect;

const notDeleted = { user: { isDeleted: false } } satisfies Prisma.PatientWhereInput;

const generateTemporaryPassword = () => randomBytes(9).toString("base64url");

const findPatientOrThrow = async (id: string) => {
	const patient = await prisma.patient.findFirst({
		where: { id, ...notDeleted },
		select: patientSelect,
	});

	if (!patient) {
		throw new AppError(httpStatus.NOT_FOUND, "Patient not found");
	}

	return patient;
};

const createPatient = async (registeredById: string, payload: TCreatePatientPayload) => {
	const { fullName, email, ...profile } = payload;

	const existingUser = await prisma.user.findUnique({
		where: { email },
		select: { patientProfile: { select: { id: true } } },
	});

	if (existingUser) {
		throw new AppError(
			httpStatus.CONFLICT,
			existingUser.patientProfile ? "A patient with this email already exists" : "Email already in use",
		);
	}

	const temporaryPassword = generateTemporaryPassword();
	const hashedPassword = await hashPassword(temporaryPassword);
	const userId = crypto.randomUUID();

	const patient = await prisma.$transaction(async (tx) => {
		await tx.user.create({
			data: {
				id: userId,
				name: fullName,
				email,
				role: Role.PATIENT,
				emailVerified: true,
				needPasswordChange: true,
			},
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

		return tx.patient.create({
			data: { userId, fullName, registeredById, ...profile },
			select: patientSelect,
		});
	});

	let emailSent = true;

	try {
		await sendEmail({
			to: email,
			subject: `Your ${envVars.CLINIC_NAME} patient account`,
			previewText: "Your account is ready. Sign in with the temporary password inside.",
			template: "staffWelcome",
			data: {
				name: fullName,
				roleLabel: "Patient",
				email,
				temporaryPassword,
				loginUrl: `${envVars.FRONTEND_URL}/login`,
			},
		});
	} catch (error) {
		console.error(`Failed to send welcome email to patient ${patient.id}`, error);
		emailSent = false;
	}

	return { patient, temporaryPassword, emailSent };
};

const getAllPatients = async (rawQuery: unknown) => {
	const q = buildListQuery(rawQuery, patientRecordListConfig, notDeleted);

	const [data, total] = await Promise.all([
		prisma.patient.findMany({ ...q.args, select: patientSelect }),
		prisma.patient.count({ where: q.where }),
	]);

	return { meta: buildMeta(total, q.page, q.limit), data };
};

const getPatientById = async (id: string) => {
	return findPatientOrThrow(id);
};

const updatePatient = async (id: string, payload: TUpdatePatientPayload) => {
	const { fullName, ...profile } = payload;

	const patient = await findPatientOrThrow(id);

	return prisma.$transaction(async (tx) => {
		if (fullName !== undefined) {
			await tx.user.update({
				where: { id: patient.user.id },
				data: { name: fullName },
			});
		}

		return tx.patient.update({
			where: { id },
			data: { fullName, ...profile },
			select: patientSelect,
		});
	});
};

const resetPassword = async (id: string) => {
	const patient = await findPatientOrThrow(id);
	const userId = patient.user.id;

	const temporaryPassword = generateTemporaryPassword();
	const hashedPassword = await hashPassword(temporaryPassword);

	await prisma.$transaction(async (tx) => {
		const { count } = await tx.account.updateMany({
			where: { userId, providerId: "credential" },
			data: { password: hashedPassword },
		});

		if (count === 0) {
			throw new AppError(httpStatus.BAD_REQUEST, "Password login is not set up for this account");
		}

		await tx.user.update({
			where: { id: userId },
			data: { needPasswordChange: true },
		});

		await tx.session.deleteMany({ where: { userId } });
	});

	let emailSent = true;

	try {
		await sendEmail({
			to: patient.user.email,
			subject: `Your ${envVars.CLINIC_NAME} password has been reset`,
			previewText: "Sign in with the new temporary password inside.",
			template: "temporaryPasswordReset",
			data: {
				name: patient.fullName,
				email: patient.user.email,
				temporaryPassword,
				loginUrl: `${envVars.FRONTEND_URL}/login`,
			},
		});
	} catch (error) {
		console.error(`Failed to send password reset email to patient ${patient.id}`, error);
		emailSent = false;
	}

	return { temporaryPassword, emailSent };
};

const updateAccountStatus = async (id: string, payload: TUpdateAccountStatusPayload) => {
	const { isActive } = payload;

	const patient = await findPatientOrThrow(id);

	return prisma.$transaction(async (tx) => {
		await tx.user.update({
			where: { id: patient.user.id },
			data: { isActive },
		});

		if (!isActive) {
			await tx.session.deleteMany({ where: { userId: patient.user.id } });
		}

		return tx.patient.findUniqueOrThrow({
			where: { id },
			select: patientSelect,
		});
	});
};

export const PatientRecordService = {
	createPatient,
	getAllPatients,
	getPatientById,
	updatePatient,
	resetPassword,
	updateAccountStatus,
};
