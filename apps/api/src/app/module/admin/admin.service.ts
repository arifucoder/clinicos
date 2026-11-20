import { AppError } from "@/app/errorHelpers/AppError";
import { prisma } from "@/app/lib/prisma";
import { buildListQuery, buildMeta } from "@/app/shared/query/queryBuilder";
import { Role } from "@/generated/prisma/enums";
import httpStatus from "http-status";
import { adminListConfig } from "./admin.constant";
import type { TUpdateAdminPayload, TUpdateAdminStatusPayload } from "./admin.interface";

const adminSelect = {
	id: true,
	name: true,
	email: true,
	phone: true,
	role: true,
	isActive: true,
	needPasswordChange: true,
	createdAt: true,
	updatedAt: true,
} as const;

const findAdminOrThrow = async (id: string) => {
	const admin = await prisma.user.findFirst({
		where: { id, role: Role.ADMIN, isDeleted: false },
		select: adminSelect,
	});

	if (!admin) {
		throw new AppError(httpStatus.NOT_FOUND, "Admin not found");
	}

	return admin;
};

const getAllAdmins = async (rawQuery: unknown) => {
	const q = buildListQuery(rawQuery, adminListConfig, { role: Role.ADMIN, isDeleted: false });

	const [data, total] = await Promise.all([
		prisma.user.findMany({ ...q.args, select: adminSelect }),
		prisma.user.count({ where: q.where }),
	]);

	return { meta: buildMeta(total, q.page, q.limit), data };
};

const getAdminById = async (id: string) => {
	return findAdminOrThrow(id);
};

const updateAdmin = async (id: string, payload: TUpdateAdminPayload) => {
	await findAdminOrThrow(id);

	return prisma.user.update({
		where: { id },
		data: payload,
		select: adminSelect,
	});
};

const updateAdminStatus = async (id: string, payload: TUpdateAdminStatusPayload) => {
	const { isActive } = payload;

	await findAdminOrThrow(id);

	return prisma.$transaction(async (tx) => {
		const admin = await tx.user.update({
			where: { id },
			data: { isActive },
			select: adminSelect,
		});

		if (!isActive) {
			await tx.session.deleteMany({ where: { userId: id } });
		}

		return admin;
	});
};

const deleteAdmin = async (id: string) => {
	await findAdminOrThrow(id);

	await prisma.$transaction([
		prisma.user.update({
			where: { id },
			data: { isDeleted: true, deletedAt: new Date(), isActive: false },
		}),
		prisma.session.deleteMany({ where: { userId: id } }),
	]);
};

export const AdminService = {
	getAllAdmins,
	getAdminById,
	updateAdmin,
	updateAdminStatus,
	deleteAdmin,
};
