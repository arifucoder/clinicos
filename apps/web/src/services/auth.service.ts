import "server-only";

import { httpClient } from "@/lib/axios/httpClient";
import type { RegisterPayload } from "@/zod/auth.validation";

interface RegisterResult {
	user: { id: string; name: string; email: string; role: string; emailVerified: boolean };
	patient: { id: string; fullName: string };
}

// register-এ কোনো login cookie লাগে না → auth: false
const registerPatient = (payload: RegisterPayload) =>
	httpClient.post<RegisterResult>("/auth/register", payload, { auth: false });

export const AuthService = {
	registerPatient,
};
