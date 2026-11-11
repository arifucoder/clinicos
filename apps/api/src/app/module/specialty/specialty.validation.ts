import * as z from "zod";

const createSpecialtySchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Name must be at least 2 characters")
		.max(100)
		.regex(/[a-z0-9]/i, "Name must contain letters or numbers"),
	description: z.string().trim().max(500).optional(),
	icon: z.string().trim().max(255).optional(),
});

export const SpecialtyValidation = { createSpecialtySchema };
