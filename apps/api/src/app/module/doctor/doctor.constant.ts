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

export const publicDoctorListConfig = defineListConfig<
	Prisma.DoctorProfileWhereInput,
	Prisma.DoctorProfileOrderByWithRelationInput
>({
	// email/phone/license দিয়ে search করা যাবে না, কারণ public-এর জন্য এগুলো private
	searchableFields: ["user.name", "doctorSpecialties.some.specialty.name"],
	filters: {
		specialty: { path: "doctorSpecialties.some.specialty.slug", type: "string" },
	},
	sortableFields: ["user.name", "consultationFeeCents"],
	defaultSortBy: "user.name",
	defaultSortOrder: "asc",
	defaultLimit: 12,
	maxLimit: 50,
});
