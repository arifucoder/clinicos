import * as z from "zod";
import { clearable, emailSchema, nameSchema, omitEmpty, phoneSchema } from "./common.validation";
import { baseListQuerySchema, sortBySchema } from "./listQuery.validation";

// api-র user.validation.ts (createDoctorSchema) আর doctor.validation.ts-এর সাথে মিল
const MAX_FEE_CENTS = 10_000_000;
export const MAX_SPECIALTIES = 5;

const specialtyIdsSchema = z
	.array(z.uuid("Invalid specialty"))
	.min(1, "Select at least one specialty")
	.max(MAX_SPECIALTIES, `Select up to ${MAX_SPECIALTIES} specialties`);
const licenseSchema = z
	.string()
	.trim()
	.toUpperCase()
	.min(3, "License number is too short")
	.max(50, "License number is too long");
const roomSchema = z.string().trim().max(20, "Room is too long");
const bioSchema = z.string().trim().max(1000, "Keep the bio under 1000 characters");

// "25.5" → 2550। 25.5 * 100-এর মতো float গুণ না; string ভেঙে integer বানাই
export const dollarsToCents = (value: string): number => {
	const [whole = "0", fraction = ""] = value.split(".");
	return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
};

// 2550 → "25.50" (edit form-এর default value)
export const centsToDollars = (cents: number): string =>
	`${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;

// form-এ fee dollar-এ লেখে (string); api-তে যায় integer cents
const feeSchema = z
	.string()
	.trim()
	.regex(/^\d+(\.\d{1,2})?$/, { error: "Enter an amount like 25 or 25.50", abort: true })
	.refine((value) => dollarsToCents(value) <= MAX_FEE_CENTS, { error: "Fee can't be more than $100,000" });

// ---------- Form (browser) ----------
// create আর edit একই schema (admin-এর মতো; edit-এ email readOnly)
export const doctorFormSchema = z.object({
	name: nameSchema,
	email: emailSchema,
	phone: phoneSchema,
	specialtyIds: specialtyIdsSchema,
	licenseNumber: licenseSchema,
	fee: feeSchema,
	roomNumber: roomSchema,
	bio: bioSchema,
});
export type DoctorFormValues = z.input<typeof doctorFormSchema>;

// ---------- Action (server): api যে আকার চায় ----------
export const createDoctorSchema = z
	.object({
		name: nameSchema,
		email: emailSchema,
		phone: omitEmpty(phoneSchema),
		specialtyIds: specialtyIdsSchema,
		licenseNumber: licenseSchema,
		fee: feeSchema,
		roomNumber: omitEmpty(roomSchema),
		bio: omitEmpty(bioSchema),
	})
	.transform(({ fee, ...rest }) => ({ ...rest, consultationFeeCents: dollarsToCents(fee) }));

export const updateDoctorSchema = z
	.object({
		name: nameSchema.optional(),
		phone: clearable(phoneSchema),
		specialtyIds: specialtyIdsSchema.optional(),
		licenseNumber: licenseSchema.optional(),
		fee: feeSchema.optional(),
		roomNumber: clearable(roomSchema),
		bio: clearable(bioSchema),
	})
	.transform(({ fee, ...rest }) => ({
		...rest,
		consultationFeeCents: fee === undefined ? undefined : dollarsToCents(fee),
	}))
	.refine((data) => Object.values(data).some((value) => value !== undefined), { error: "Nothing to update" });

export type CreateDoctorPayload = z.output<typeof createDoctorSchema>;
export type UpdateDoctorPayload = z.output<typeof updateDoctorSchema>;

export const doctorIdSchema = z.uuid("Invalid doctor id");

// ---------- URL ----------
export const doctorListQuerySchema = baseListQuerySchema.extend({
	sortBy: sortBySchema(["createdAt", "user.name", "consultationFeeCents"]), // api-র doctorListConfig
	isActive: z.enum(["true", "false"]).optional().catch(undefined),
	specialty: z.string().trim().max(100).optional().catch(undefined), // specialty-র slug
});
export type DoctorListQuery = z.output<typeof doctorListQuerySchema>;

// ---------- নিজের profile (doctor) ----------
// api-র updateMyProfileSchema: শুধু name, phone, bio। license/fee/specialty/room admin-এর কাজ।
export const myProfileFormSchema = z.object({
	name: nameSchema,
	phone: phoneSchema,
	bio: bioSchema,
});
export type MyProfileFormValues = z.input<typeof myProfileFormSchema>;

// form সব সময় তিনটাই পাঠায় → "Nothing to update" লাগে না
export const updateMyProfileSchema = z.object({
	name: nameSchema,
	phone: clearable(phoneSchema), // "" → null (মুছে ফেলো)
	bio: clearable(bioSchema),
});
export type UpdateMyProfilePayload = z.output<typeof updateMyProfileSchema>;

// api-র uploadPhoto.ts আর getValidatedPhoto.ts-এর সাথে মিল (এখানে শুধু UX, আসল যাচাই api-তে)
export const PHOTO_MAX_BYTES = 2 * 1024 * 1024;
export const PHOTO_TYPES: readonly string[] = ["image/jpeg", "image/png", "image/webp"];

// ---------- Public find-doctor URL (/doctors?specialty=cardiology&date=2026-11-24&sort=fee-asc) ----------
// api শুধু এগুলো বোঝে: searchTerm (নাম/specialty), specialty (একটা slug), date, sortBy (user.name | consultationFeeCents)
export const DOCTOR_SORT_KEYS = ["name", "fee-asc", "fee-desc"] as const;
export type DoctorSortKey = (typeof DOCTOR_SORT_KEYS)[number];

// .catch(): URL-এ আজেবাজে value এলে page ভাঙে না, default বসে
export const publicDoctorListQuerySchema = z.object({
	page: z.coerce.number().int().min(1).catch(1),
	searchTerm: z.string().trim().max(100).optional().catch(undefined),
	specialty: z
		.string()
		.trim()
		.regex(/^[a-z0-9-]+$/)
		.max(100)
		.optional()
		.catch(undefined),
	date: z.iso.date().optional().catch(undefined),
	sort: z.enum(DOCTOR_SORT_KEYS).catch("name"),
});
export type PublicDoctorListQuery = z.output<typeof publicDoctorListQuerySchema>;
