import type { TAuthPayload } from "@/app/utils/token";

declare global {
	namespace Express {
		interface Request {
			user?: TAuthPayload;
		}
	}
}
