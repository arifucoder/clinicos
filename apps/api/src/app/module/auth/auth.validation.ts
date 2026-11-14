import * as z from "zod";

const registerSchema = z.object({
	name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
	email: z.string().trim().toLowerCase().pipe(z.email("Invalid email address")),
	password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const AuthValidation = {
	registerSchema,
};
