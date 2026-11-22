import * as z from "zod";
import { clearable, emailSchema, nameSchema, omitEmpty, phoneSchema } from "./common.validation";
import { baseListQuerySchema, sortBySchema } from "./listQuery.validation";

// ---------- Form (browser) ----------
// create আর edit একই schema: edit-এ email readOnly, কিন্তু DB থেকে আসা valid email, তাই যাচাই পাস করে
export const adminFormSchema = z.object({ name: nameSchema, email: emailSchema, phone: phoneSchema });
export type AdminFormValues = z.input<typeof adminFormSchema>;

// ---------- Action (server): api যে আকার চায় ----------
export const createAdminSchema = z.object({ name: nameSchema, email: emailSchema, phone: omitEmpty(phoneSchema) });

// z.object অচেনা key (যেমন email) ফেলে দেয় → edit-এ email api-তে যায়ই না
export const updateAdminSchema = z
	.object({ name: nameSchema.optional(), phone: clearable(phoneSchema) })
	.refine((data) => Object.values(data).some((value) => value !== undefined), { error: "Nothing to update" });

export type CreateAdminPayload = z.output<typeof createAdminSchema>;
export type UpdateAdminPayload = z.output<typeof updateAdminSchema>;

export const adminIdSchema = z.uuid("Invalid admin id");

// ---------- URL ----------
export const STAFF_PAGE_SIZES = [10, 20, 50] as const;

export const adminListQuerySchema = baseListQuerySchema.extend({
	sortBy: sortBySchema(["createdAt", "name"]), // api-র adminListConfig.sortableFields
	isActive: z.enum(["true", "false"]).optional().catch(undefined),
});
export type AdminListQuery = z.output<typeof adminListQuerySchema>;

// ?tab=doctors|admins — ভুল value এলে doctors
export const staffTabSchema = z.enum(["doctors", "admins"]).catch("doctors");
export type StaffTab = z.output<typeof staffTabSchema>;
