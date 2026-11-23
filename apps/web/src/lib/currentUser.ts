import "server-only";

import { AuthService, type MeResult } from "@/services/auth.service";
import { isAxiosError } from "axios";
import { cache } from "react";

export const getCurrentUser = cache(async (): Promise<MeResult | null> => {
	try {
		const response = await AuthService.getMe();
		return response.data;
	} catch (error) {
		const status = isAxiosError(error) ? error.response?.status : undefined;
		if (status === 401 || status === 403) return null; // session আসলেই শেষ
		throw error; // api down → error.tsx দেখাবে, ভুল করে logout করাবে না
	}
});
