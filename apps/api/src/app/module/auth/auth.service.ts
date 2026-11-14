import { AppError } from "@/app/errorHelpers/AppError";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { Role } from "@/generated/prisma/enums";
import { hashPassword } from "better-auth/crypto";
import httpStatus from "http-status";
import type { TRegisterPayload } from "./auth.interface";

const registerPatient = async (payload: TRegisterPayload) => {
	const { name, email, password } = payload;

	const existingUser = await prisma.user.findUnique({
		where: { email },
		select: { id: true },
	});

	if (existingUser) {
		throw new AppError(httpStatus.CONFLICT, "An account with this email already exists");
	}

	const hashedPassword = await hashPassword(password);
	const userId = crypto.randomUUID();

	const result = await prisma.$transaction(async (tx) => {
		const user = await tx.user.create({
			data: { id: userId, name, email, role: Role.PATIENT },
			select: { id: true, name: true, email: true, role: true, emailVerified: true },
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

		const patient = await tx.patient.create({
			data: { userId, fullName: name },
			select: { id: true, fullName: true },
		});

		return { user, patient };
	});

	try {
		await auth.api.sendVerificationOTP({
			body: { email, type: "email-verification" },
		});
	} catch (error) {
		console.error("Failed to send verification OTP", error);
	}

	return result;
};

export const AuthService = {
	registerPatient,
};
