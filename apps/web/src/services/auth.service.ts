import "server-only";

import { httpClient } from "@/lib/axios/httpClient";
import type { TRegisterPayload } from "@/zod/auth.validation";

interface RegisterResult {
	user: { id: string; name: string; email: string; role: string; emailVerified: boolean };
	patient: { id: string; fullName: string };
}

// register-এ কোনো login cookie লাগে না → auth: false
const registerPatient = (payload: TRegisterPayload) =>
	httpClient.post<RegisterResult>("/auth/register", payload, { auth: false });

export const AuthService = {
	registerPatient,
};
