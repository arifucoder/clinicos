import "server-only";

import type { UserRole } from "@/lib/authRedirect";
import { httpClient } from "@/lib/axios/httpClient";
import type {
	ChangePasswordPayload,
	ForgetPasswordPayload,
	LoginPayload,
	RegisterPayload,
	ResendOtpPayload,
	ResetPasswordPayload,
	VerifyEmailPayload,
} from "@/zod/auth.validation";

interface RegisterResult {
	user: { id: string; name: string; email: string; role: string; emailVerified: boolean };
	patient: { id: string; fullName: string };
}

interface VerifyEmailResult {
	email: string;
	emailVerified: boolean;
}

const registerPatient = (payload: RegisterPayload) =>
	httpClient.post<RegisterResult>("/auth/register", payload, { auth: false });

const verifyEmail = (payload: VerifyEmailPayload) =>
	httpClient.post<VerifyEmailResult>("/auth/verify-email", payload, { auth: false });

const resendOtp = (payload: ResendOtpPayload) => httpClient.post<null>("/auth/resend-otp", payload, { auth: false });

export interface LoginResult {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	needPasswordChange: boolean;
}

const login = (payload: LoginPayload) =>
	httpClient.postWithCookies<LoginResult>("/auth/login", payload, { auth: false });

const forgetPassword = (payload: ForgetPasswordPayload) =>
	httpClient.post<null>("/auth/forget-password", payload, { auth: false });

const resetPassword = (payload: ResetPasswordPayload) =>
	httpClient.post<null>("/auth/reset-password", payload, { auth: false });

export interface MeResult {
	id: string;
	name: string;
	email: string;
	image: string | null;
	role: UserRole;
	needPasswordChange: boolean;
	doctorProfile: { id: string; photoUrl: string | null } | null;
}

const getMe = () => httpClient.get<MeResult>("/auth/me");

const logout = () => httpClient.post<null>("/auth/logout", null);

const changePassword = (payload: ChangePasswordPayload) => httpClient.post<null>("/auth/change-password", payload);

export const AuthService = {
	registerPatient,
	verifyEmail,
	resendOtp,
	login,
	forgetPassword,
	resetPassword,
	getMe,
	logout,
	changePassword,
};
