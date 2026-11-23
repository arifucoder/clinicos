import * as z from "zod";
import { clearable, emailSchema, nameSchema, omitEmpty, phoneSchema } from "./common.validation";
import { baseListQuerySchema, sortBySchema } from "./listQuery.validation";

export const adminFormSchema = z.object({ name: nameSchema, email: emailSchema, phone: phoneSchema });
export type AdminFormValues = z.input<typeof adminFormSchema>;

export const createAdminSchema = z.object({ name: nameSchema, email: emailSchema, phone: omitEmpty(phoneSchema) });

export const updateAdminSchema = z
	.object({ name: nameSchema.optional(), phone: clearable(phoneSchema) })
	.refine((data) => Object.values(data).some((value) => value !== undefined), { error: "Nothing to update" });

export type CreateAdminPayload = z.output<typeof createAdminSchema>;
export type UpdateAdminPayload = z.output<typeof updateAdminSchema>;

export const adminIdSchema = z.uuid("Invalid admin id");

export const STAFF_PAGE_SIZES = [10, 20, 50] as const;

export const adminListQuerySchema = baseListQuerySchema.extend({
	sortBy: sortBySchema(["createdAt", "name"]), // api-র adminListConfig.sortableFields
	isActive: z.enum(["true", "false"]).optional().catch(undefined),
});
export type AdminListQuery = z.output<typeof adminListQuerySchema>;

export const staffTabSchema = z.enum(["doctors", "admins"]).catch("doctors");
export type StaffTab = z.output<typeof staffTabSchema>;
