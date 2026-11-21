import "server-only";

import type { UserRole } from "@/lib/authRedirect";
import { httpClient } from "@/lib/axios/httpClient";
import type { LoginPayload, RegisterPayload, ResendOtpPayload, VerifyEmailPayload } from "@/zod/auth.validation";

interface RegisterResult {
	user: { id: string; name: string; email: string; role: string; emailVerified: boolean };
	patient: { id: string; fullName: string };
}

interface VerifyEmailResult {
	email: string;
	emailVerified: boolean;
}

// এগুলোর কোনোটাতেই login cookie লাগে না → auth: false
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

// login-এ api-র Set-Cookie header লাগে → postWithCookies
const login = (payload: LoginPayload) =>
	httpClient.postWithCookies<LoginResult>("/auth/login", payload, { auth: false });

export const AuthService = {
	registerPatient,
	verifyEmail,
	resendOtp,
	login,
};
