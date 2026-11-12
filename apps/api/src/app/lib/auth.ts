import { envVars } from "@/app/config/env";
import { prisma } from "@/app/lib/prisma";
import { Role } from "@/generated/prisma/enums";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
	baseURL: envVars.BETTER_AUTH_URL,
	secret: envVars.BETTER_AUTH_SECRET,

	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),

	emailAndPassword: {
		enabled: true,
	},

	user: {
		additionalFields: {
			role: { type: "string", input: false, defaultValue: Role.PATIENT },
			isActive: { type: "boolean", input: false, defaultValue: true },
			needPasswordChange: { type: "boolean", input: false, defaultValue: false },
		},
	},

	advanced: {
		database: {
			generateId: () => crypto.randomUUID(),
		},
	},
});
