import * as z from "zod";

export const SLOT_MINUTES = ["10", "15", "20", "30"] as const;
export const MAX_DATES_PER_REQUEST = 14;
export const OPEN_MAX_DAYS_AHEAD = 30;
export const MAX_BREAKS = 5;
export const BOARD_DAYS = 7;

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm (24-hour)");
const clinicDateSchema = z.iso.date("Invalid date");

const breakSchema = z
	.object({ startTime: timeSchema, endTime: timeSchema })
	.refine((range) => range.startTime !== range.endTime, {
		error: "Start and end can't be the same",
		path: ["endTime"],
	});

export const openSlotsFormSchema = z
	.object({
		dates: z
			.array(clinicDateSchema)
			.min(1, "Pick at least one date")
			.max(MAX_DATES_PER_REQUEST, `Pick up to ${MAX_DATES_PER_REQUEST} dates`),
		startTime: timeSchema,
		endTime: timeSchema,
		slotMinutes: z.enum(SLOT_MINUTES, "Pick a slot length"),
		breaks: z.array(breakSchema).max(MAX_BREAKS, `At most ${MAX_BREAKS} breaks`),
	})
	.refine((data) => data.startTime !== data.endTime, {
		error: "End time must be different from start time",
		path: ["endTime"],
	});
export type OpenSlotsFormValues = z.input<typeof openSlotsFormSchema>;

export const blockSlotsFormSchema = z.object({
	reason: z.string().trim().min(3, "Reason must be at least 3 characters").max(200, "Keep it under 200 characters"),
});
export type BlockSlotsFormValues = z.input<typeof blockSlotsFormSchema>;

export const openSlotsSchema = openSlotsFormSchema.transform(({ slotMinutes, ...rest }) => ({
	...rest,
	slotMinutes: Number(slotMinutes), // form-এ Select string দেয়, api number চায়
}));
export type OpenSlotsPayload = z.output<typeof openSlotsSchema>;

export const slotIdsSchema = z.array(z.uuid("Invalid slot")).min(1, "Select at least one slot").max(1000);
export const deleteSlotIdsSchema = z.array(z.uuid("Invalid slot")).min(1).max(50, "Delete up to 50 slots at a time");

export const blockSlotsSchema = blockSlotsFormSchema.extend({ slotIds: slotIdsSchema });
export type BlockSlotsPayload = z.output<typeof blockSlotsSchema>;

export const slotDoctorIdSchema = z.union([z.literal("me"), z.uuid("Invalid doctor")]);

export const slotPageQuerySchema = z.object({
	doctorId: z.uuid().optional().catch(undefined),
	from: clinicDateSchema.optional().catch(undefined),
});
