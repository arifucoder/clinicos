import { AppError } from "@/app/errorHelpers/AppError";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { REFRESH_TOKEN_MAX_AGE } from "@/app/utils/cookie";
import { tokenUtils } from "@/app/utils/token";
import { Role } from "@/generated/prisma/enums";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import httpStatus from "http-status";
import type {
	TChangePasswordPayload,
	TForgetPasswordPayload,
	TLoginPayload,
	TRegisterPayload,
	TResendOtpPayload,
	TResetPasswordPayload,
	TVerifyEmailPayload,
} from "./auth.interface";

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

const verifyEmail = async (payload: TVerifyEmailPayload) => {
	const { email, otp } = payload;

	const { user } = await auth.api.verifyEmailOTP({
		body: { email, otp },
	});

	return { email: user.email, emailVerified: user.emailVerified };
};

const resendOtp = async (payload: TResendOtpPayload) => {
	const { email } = payload;

	await auth.api.sendVerificationOTP({
		body: { email, type: "email-verification" },
	});
};

const login = async (payload: TLoginPayload) => {
	const { email, password } = payload;

	const { token: sessionToken, user: signedInUser } = await auth.api.signInEmail({
		body: { email, password },
	});

	const user = await prisma.user.findUniqueOrThrow({
		where: { id: signedInUser.id },
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			isActive: true,
			isDeleted: true,
			needPasswordChange: true,
		},
	});

	if (!user.isActive || user.isDeleted) {
		await prisma.session.deleteMany({ where: { token: sessionToken } });
		throw new AppError(httpStatus.FORBIDDEN, "Your account is disabled. Contact the clinic");
	}

	const tokenPayload = { userId: user.id, role: user.role };

	return {
		accessToken: tokenUtils.getAccessToken(tokenPayload),
		refreshToken: tokenUtils.getRefreshToken(tokenPayload),
		sessionToken,
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			needPasswordChange: user.needPasswordChange,
		},
	};
};

const getMe = async (userId: string) => {
	return prisma.user.findUniqueOrThrow({
		where: { id: userId },
		select: {
			id: true,
			name: true,
			email: true,
			emailVerified: true,
			image: true,
			role: true,
			needPasswordChange: true,
			// doctor-এর ছবি থাকে doctor_profiles-এ (users.image না) → topbar-এর avatar এখান থেকে
			doctorProfile: { select: { id: true, photoUrl: true } },
			patientProfile: {
				select: {
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
				},
			},
		},
	});
};

const refreshTokens = async (refreshToken: string, sessionToken: string) => {
	const payload = tokenUtils.verifyRefreshToken(refreshToken);

	const session = await prisma.session.findUnique({
		where: { token: sessionToken },
		select: {
			userId: true,
			expiresAt: true,
			user: { select: { role: true, isActive: true, isDeleted: true } },
		},
	});

	if (!session || session.expiresAt <= new Date() || session.userId !== payload.userId) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Session expired. Please log in again");
	}

	if (!session.user.isActive || session.user.isDeleted) {
		throw new AppError(httpStatus.FORBIDDEN, "Your account is disabled. Contact the clinic");
	}

	const tokenPayload = { userId: session.userId, role: session.user.role };

	await prisma.session.update({
		where: { token: sessionToken },
		data: { expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE) },
	});

	return {
		accessToken: tokenUtils.getAccessToken(tokenPayload),
		refreshToken: tokenUtils.getRefreshToken(tokenPayload),
		sessionToken,
	};
};

const logout = async (sessionToken: string | undefined) => {
	if (!sessionToken) return;

	await prisma.session.deleteMany({ where: { token: sessionToken } });
};

const changePassword = async (userId: string, sessionToken: string | undefined, payload: TChangePasswordPayload) => {
	const { currentPassword, newPassword } = payload;

	const account = await prisma.account.findFirst({
		where: { userId, providerId: "credential" },
		select: { id: true, password: true },
	});

	if (!account?.password) {
		throw new AppError(httpStatus.BAD_REQUEST, "Password login is not set up for this account");
	}

	const isMatch = await verifyPassword({ hash: account.password, password: currentPassword });

	if (!isMatch) {
		throw new AppError(httpStatus.BAD_REQUEST, "Current password is incorrect");
	}

	const hashedPassword = await hashPassword(newPassword);

	await prisma.$transaction([
		prisma.account.update({
			where: { id: account.id },
			data: { password: hashedPassword },
		}),
		prisma.user.update({
			where: { id: userId },
			data: { needPasswordChange: false },
		}),

		prisma.session.deleteMany({
			where: { userId, ...(sessionToken && { token: { not: sessionToken } }) },
		}),
	]);
};

type TResetCheckUser = { isActive: boolean; isDeleted: boolean; emailVerified: boolean } | null;

const canResetPassword = (user: TResetCheckUser) =>
	user !== null && user.isActive && !user.isDeleted && user.emailVerified;

const forgetPassword = async (payload: TForgetPasswordPayload) => {
	const { email } = payload;

	const user = await prisma.user.findUnique({
		where: { email },
		select: { isActive: true, isDeleted: true, emailVerified: true },
	});

	if (!canResetPassword(user)) return;

	await auth.api.requestPasswordResetEmailOTP({
		body: { email },
	});
};

const resetPassword = async (payload: TResetPasswordPayload) => {
	const { email, otp, newPassword } = payload;

	const user = await prisma.user.findUnique({
		where: { email },
		select: { isActive: true, isDeleted: true, emailVerified: true },
	});

	if (!canResetPassword(user)) {
		throw new AppError(httpStatus.BAD_REQUEST, "Invalid verification code");
	}

	await auth.api.resetPasswordEmailOTP({
		body: { email, otp, password: newPassword },
	});
};

export const AuthService = {
	registerPatient,
	verifyEmail,
	resendOtp,
	login,
	getMe,
	refreshTokens,
	logout,
	changePassword,
	forgetPassword,
	resetPassword,
};
