import { AppError } from "@/app/errorHelpers/AppError";
import httpStatus from "http-status";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

export type TExpiresIn = NonNullable<SignOptions["expiresIn"]>;

const createToken = (payload: JwtPayload, secret: string, expiresIn: TExpiresIn): string => {
	return jwt.sign(payload, secret, { algorithm: "HS256", expiresIn });
};

const verifyToken = (token: string, secret: string): JwtPayload => {
	try {
		const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });

		if (typeof decoded === "string") {
			throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token payload");
		}

		return decoded;
	} catch (error) {
		if (error instanceof AppError) throw error;

		if (error instanceof jwt.TokenExpiredError) {
			throw new AppError(httpStatus.UNAUTHORIZED, "Token has expired");
		}

		throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token");
	}
};

const decodeToken = (token: string): JwtPayload | null => {
	const decoded = jwt.decode(token);
	return decoded && typeof decoded !== "string" ? decoded : null;
};

export const jwtUtils = {
	createToken,
	verifyToken,
	decodeToken,
};
