import { SLOT_CONFIG } from "@/app/config/slot.config";
import * as z from "zod";
import { toBreakWindow, toShiftWindow } from "./slot.utils";

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm (24-hour) format");
const clinicDateSchema = z.iso.date("Date must be in YYYY-MM-DD format");
const timeRangeSchema = z.object({ startTime: timeSchema, endTime: timeSchema });
const slotIdsSchema = z
	.array(z.uuid("Invalid slot id"))
	.min(1, "Select at least one slot")
	.max(SLOT_CONFIG.maxSlotsPerRequest)
	.transform((ids) => [...new Set(ids)]);

const openSlotsSchema = z
	.object({
		dates: z
			.array(clinicDateSchema)
			.min(1, "Select at least one date")
			.max(SLOT_CONFIG.maxDatesPerRequest, `At most ${SLOT_CONFIG.maxDatesPerRequest} dates per request`)
			.transform((dates) => [...new Set(dates)].toSorted()),
		startTime: timeSchema,
		endTime: timeSchema,
		slotMinutes: z
			.number()
			.int()
			.refine((value) => SLOT_CONFIG.allowedSlotMinutes.includes(value), {
				error: `Slot length must be one of ${SLOT_CONFIG.allowedSlotMinutes.join(", ")} minutes`,
			}),
		breaks: z.array(timeRangeSchema).max(SLOT_CONFIG.maxBreaks, `At most ${SLOT_CONFIG.maxBreaks} breaks`).default([]),
	})
	.superRefine((data, ctx) => {
		if (data.startTime === data.endTime) {
			ctx.addIssue({ code: "custom", path: ["endTime"], message: "End time must be different from start time" });
			return;
		}

		const shift = toShiftWindow(data);
		if (shift.end - shift.start < data.slotMinutes) {
			ctx.addIssue({ code: "custom", path: ["endTime"], message: "Shift is shorter than one slot" });
		}

		const windows = data.breaks.map((range, index) => ({ index, range, window: toBreakWindow(range, shift) }));

		for (const { index, range, window } of windows) {
			if (range.startTime === range.endTime) {
				ctx.addIssue({ code: "custom", path: ["breaks", index], message: "Break start and end are the same" });
			} else if (window.start <= shift.start || window.end >= shift.end) {
				ctx.addIssue({ code: "custom", path: ["breaks", index], message: "Break must be inside the shift" });
			}
		}

		const sorted = windows.toSorted((a, b) => a.window.start - b.window.start);
		sorted.forEach((current, i) => {
			const next = sorted[i + 1];
			if (next && next.window.start < current.window.end) {
				ctx.addIssue({ code: "custom", path: ["breaks", next.index], message: "Breaks must not overlap" });
			}
		});
	});

const blockSlotsSchema = z
	.object({
		slotIds: slotIdsSchema.optional(),
		from: z.iso
			.datetime({ offset: true })
			.transform((value) => new Date(value))
			.optional(),
		to: z.iso
			.datetime({ offset: true })
			.transform((value) => new Date(value))
			.optional(),
		reason: z.string().trim().min(3, "Reason must be at least 3 characters").max(200),
	})
	.superRefine((data, ctx) => {
		const byIds = data.slotIds !== undefined;
		const byRange = data.from !== undefined || data.to !== undefined;

		if (byIds === byRange) {
			ctx.addIssue({ code: "custom", path: ["slotIds"], message: "Send either slotIds or a from–to range" });
			return;
		}
		if (byRange && (!data.from || !data.to || data.from >= data.to)) {
			ctx.addIssue({ code: "custom", path: ["to"], message: "'to' must be after 'from'" });
		}
	});

const unblockSlotsSchema = z.object({ slotIds: slotIdsSchema });

const doctorParamSchema = z.object({ doctorId: z.union([z.literal("me"), z.uuid("Invalid doctor id")]) });
const publicDoctorParamSchema = z.object({ doctorId: z.uuid("Invalid doctor id") });
const slotParamSchema = doctorParamSchema.extend({ slotId: z.uuid("Invalid slot id") });

// Doctor/admin: calendar-এর week/month সবসময় জানা, অতীতও দেখা লাগে → দুটোই আবশ্যক
const manageSlotQuerySchema = z
	.object({ from: clinicDateSchema, to: clinicDateSchema })
	.refine((query) => query.from <= query.to, { error: "'from' must be on or before 'to'", path: ["to"] });

// Public: না দিলে আজ থেকে booking window (১৪ দিন)
const publicSlotQuerySchema = z
	.object({ from: clinicDateSchema.optional(), to: clinicDateSchema.optional() })
	.refine((query) => !query.from || !query.to || query.from <= query.to, {
		error: "'from' must be on or before 'to'",
		path: ["to"],
	});

export const SlotValidation = {
	openSlotsSchema,
	blockSlotsSchema,
	unblockSlotsSchema,
	doctorParamSchema,
	publicDoctorParamSchema,
	slotParamSchema,
	manageSlotQuerySchema,
	publicSlotQuerySchema,
};
