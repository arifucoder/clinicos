import { envVars } from "@/app/config/env";
import { AppError } from "@/app/errorHelpers/AppError";
import { prisma } from "@/app/lib/prisma";
import { sendEmail } from "@/app/shared/sendEmail";
import { Role } from "@/generated/prisma/enums";
import { hashPassword } from "better-auth/crypto";
import httpStatus from "http-status";
import { randomBytes } from "node:crypto";
import type { TCreateAdminPayload } from "./user.interface";

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

export const UserService = {
	createAdmin,
};
