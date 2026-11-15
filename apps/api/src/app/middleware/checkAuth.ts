import { AppError } from "@/app/errorHelpers/AppError";
import { prisma } from "@/app/lib/prisma";
import { COOKIE_NAMES, cookieUtils } from "@/app/utils/cookie";
import { tokenUtils } from "@/app/utils/token";
import { Role } from "@/generated/prisma/enums";
import type { RequestHandler } from "express";
import httpStatus from "http-status";

export const ADMINS = [Role.SUPER_ADMIN, Role.ADMIN] as const;
export const STAFF = [...ADMINS, Role.DOCTOR] as const;

export const checkAuth = (...allowedRoles: Role[]): RequestHandler => {
	return async (req, _res, next) => {
		const sessionToken = cookieUtils.getCookie(req, COOKIE_NAMES.session);
		const accessToken = cookieUtils.getCookie(req, COOKIE_NAMES.accessToken);

		if (!sessionToken || !accessToken) {
			throw new AppError(httpStatus.UNAUTHORIZED, "You are not logged in");
		}

		const payload = tokenUtils.verifyAccessToken(accessToken);

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

		const { role } = session.user;

		if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
			throw new AppError(httpStatus.FORBIDDEN, "You do not have permission to do this");
		}

		req.user = { userId: session.userId, role };
		next();
	};
};
