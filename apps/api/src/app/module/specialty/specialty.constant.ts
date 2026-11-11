import { defineListConfig } from "@/app/shared/query/queryBuilder";
import type { Prisma } from "@/generated/prisma/client";

export const specialtyListConfig = defineListConfig<
	Prisma.SpecialtyWhereInput,
	Prisma.SpecialtyOrderByWithRelationInput
>({
	searchableFields: ["name", "description"],
	filters: {
		isActive: { path: "isActive", type: "boolean" },
	},
	sortableFields: ["name", "createdAt"],
	defaultSortBy: "name",
	defaultSortOrder: "asc",
});
