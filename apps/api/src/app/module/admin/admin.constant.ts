import { defineListConfig } from "@/app/shared/query/queryBuilder";
import type { Prisma } from "@/generated/prisma/client";

export const adminListConfig = defineListConfig<Prisma.UserWhereInput, Prisma.UserOrderByWithRelationInput>({
	searchableFields: ["name", "email", "phone"],
	filters: {
		isActive: { path: "isActive", type: "boolean" },
	},
	sortableFields: ["name", "createdAt"],
	defaultSortBy: "createdAt",
	defaultSortOrder: "desc",
});
