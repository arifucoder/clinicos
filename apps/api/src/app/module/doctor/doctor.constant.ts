import { defineListConfig } from "@/app/shared/query/queryBuilder";
import type { Prisma } from "@/generated/prisma/client";

export const doctorListConfig = defineListConfig<
	Prisma.DoctorProfileWhereInput,
	Prisma.DoctorProfileOrderByWithRelationInput
>({
	searchableFields: ["user.name", "user.email", "user.phone", "licenseNumber"],
	filters: {
		isActive: { path: "user.isActive", type: "boolean" },
		specialty: { path: "doctorSpecialties.some.specialty.slug", type: "string" },
	},
	sortableFields: ["user.name", "consultationFeeCents", "createdAt"],
	defaultSortBy: "createdAt",
	defaultSortOrder: "desc",
});
