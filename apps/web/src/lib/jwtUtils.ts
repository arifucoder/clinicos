import { USER_ROLES } from "@/lib/authRedirect";
import jwt from "jsonwebtoken";
import * as z from "zod";

const accessTokenPayloadSchema = z.object({
	userId: z.string().min(1),
	role: z.enum(USER_ROLES),
	exp: z.number(),
});

export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;

export const decodeAccessToken = (token: string | undefined): AccessTokenPayload | null => {
	if (!token) return null;
	const parsed = accessTokenPayloadSchema.safeParse(jwt.decode(token));
	return parsed.success ? parsed.data : null;
};

export const isExpiringSoon = (exp: number, bufferSeconds = 60) => exp * 1000 - Date.now() < bufferSeconds * 1000;

export const isExpired = (exp: number) => exp * 1000 <= Date.now();
