import { prisma } from "@/app/lib/prisma";
import { slugify } from "@/app/shared/slugify";
import type { TCreateSpecialtyPayload } from "./specialty.interface";

const createSpecialty = async (payload: TCreateSpecialtyPayload) => {
	return prisma.specialty.create({
		data: { ...payload, slug: slugify(payload.name) },
		omit: { isDeleted: true, deletedAt: true },
	});
};

export const SpecialtyService = { createSpecialty };
