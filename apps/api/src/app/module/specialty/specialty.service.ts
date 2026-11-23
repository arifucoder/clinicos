import { AppError } from "@/app/errorHelpers/AppError";
import { prisma } from "@/app/lib/prisma";
import { buildListQuery, buildMeta } from "@/app/shared/query/queryBuilder";
import { slugify } from "@/app/shared/slugify";
import type { Prisma } from "@/generated/prisma/client";
import httpStatus from "http-status";
import { specialtyListConfig } from "./specialty.constant";
import type { TCreateSpecialtyPayload, TUpdateSpecialtyPayload } from "./specialty.interface";

const hiddenFields = { isDeleted: true, deletedAt: true } as const;

const createSpecialty = async (payload: TCreateSpecialtyPayload) => {
	return prisma.specialty.create({
		data: { ...payload, slug: slugify(payload.name) },
		omit: hiddenFields,
	});
};

const getAllSpecialties = async (rawQuery: unknown) => {
	const q = buildListQuery(rawQuery, specialtyListConfig, { isDeleted: false });

	const [data, total] = await Promise.all([
		prisma.specialty.findMany({ ...q.args, omit: hiddenFields }),
		prisma.specialty.count({ where: q.where }),
	]);

	return { meta: buildMeta(total, q.page, q.limit), data };
};

const activeDoctorLink = {
	doctorProfile: { user: { isDeleted: false, isActive: true } },
} satisfies Prisma.DoctorSpecialtyWhereInput;

const getPublicSpecialties = async () => {
	const rows = await prisma.specialty.findMany({
		where: { isActive: true, isDeleted: false, doctorSpecialties: { some: activeDoctorLink } },
		orderBy: { name: "asc" },
		select: {
			name: true,
			slug: true,
			icon: true,
			_count: { select: { doctorSpecialties: { where: activeDoctorLink } } },
		},
	});

	return rows.map(({ _count, ...specialty }) => ({ ...specialty, doctorCount: _count.doctorSpecialties }));
};

const getSpecialtyById = async (id: string) => {
	const specialty = await prisma.specialty.findFirst({
		where: { id, isDeleted: false },
		omit: hiddenFields,
	});

	if (!specialty) {
		throw new AppError(httpStatus.NOT_FOUND, "Specialty not found");
	}

	return specialty;
};

const updateSpecialty = async (id: string, payload: TUpdateSpecialtyPayload) => {
	return prisma.specialty.update({
		where: { id, isDeleted: false },
		data: {
			...payload,
			...(payload.name ? { slug: slugify(payload.name) } : {}),
		},
		omit: hiddenFields,
	});
};

const deleteSpecialty = async (id: string) => {
	await prisma.specialty.update({
		where: { id, isDeleted: false },
		data: { isDeleted: true, deletedAt: new Date(), isActive: false },
	});
};

export const SpecialtyService = {
	createSpecialty,
	getAllSpecialties,
	getPublicSpecialties,
	getSpecialtyById,
	updateSpecialty,
	deleteSpecialty,
};
