import { USER_ROLES } from "@/lib/authRedirect";
import jwt from "jsonwebtoken";
import * as z from "zod";

const accessTokenPayloadSchema = z.object({
	userId: z.string().min(1),
	role: z.enum(USER_ROLES),
	exp: z.number(),
});

export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;

// শুধু payload পড়ে, signature যাচাই করে না (web-এ secret নেই)।
// তাই এটা শুধু redirect-এর মতো UX-এর জন্য; আসল যাচাই api-র checkAuth-এ।
export const decodeAccessToken = (token: string | undefined): AccessTokenPayload | null => {
	if (!token) return null;
	const parsed = accessTokenPayloadSchema.safeParse(jwt.decode(token));
	return parsed.success ? parsed.data : null;
};

// exp সেকেন্ডে, Date.now() মিলিসেকেন্ডে
export const isExpiringSoon = (exp: number, bufferSeconds = 60) => exp * 1000 - Date.now() < bufferSeconds * 1000;

export const isExpired = (exp: number) => exp * 1000 <= Date.now();
