import { defineListConfig } from "@/app/shared/query/queryBuilder";
import type { Prisma } from "@/generated/prisma/client";
import { BloodGroup, Gender } from "@/generated/prisma/enums";

export const patientRecordListConfig = defineListConfig<
	Prisma.PatientWhereInput,
	Prisma.PatientOrderByWithRelationInput
>({
	searchableFields: ["fullName", "phone", "user.email"],
	filters: {
		isActive: { path: "user.isActive", type: "boolean" },
		gender: { path: "gender", type: "enum", values: Object.values(Gender) },
		bloodGroup: { path: "bloodGroup", type: "enum", values: Object.values(BloodGroup) },
	},
	sortableFields: ["fullName", "dateOfBirth", "createdAt"],
	defaultSortBy: "createdAt",
	defaultSortOrder: "desc",
});
