import * as z from "zod";

const DURATION_REGEX = /^\d+(?:\.\d+)?\s?(?:ms|s|m|h|d|w|y)$/i;

const isValidTimeZone = (timeZone: string): boolean => {
	try {
		new Intl.DateTimeFormat("en-US", { timeZone }).format();
		return true;
	} catch {
		return false;
	}
};

const secret = z.string().min(32, "Must be at least 32 characters (generate: openssl rand -base64 32)");
const duration = z.string().regex(DURATION_REGEX, 'Must be a duration like "15m", "1d" or "7d"');

const envSchema = z
	.object({
		NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
		PORT: z.coerce.number().int().min(1).max(65535).default(5000),
		FRONTEND_URL: z.url({ protocol: /^https?$/ }),

		DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),

		SUPER_ADMIN_NAME: z.string().trim().min(1).default("Super Admin"),
		SUPER_ADMIN_EMAIL: z.email().optional(),
		SUPER_ADMIN_PASSWORD: z.string().min(8).optional(),

		CLINIC_TIME_ZONE: z.string().refine(isValidTimeZone, "Must be a valid IANA time zone, e.g. Asia/Dhaka"),
		CLINIC_NAME: z.string().trim().min(1).default("ClinicOS"),
		CLINIC_ADDRESS: z.string().trim().min(1).default("123 Health Avenue, Dhaka"),
		CLINIC_PHONE: z.string().trim().min(1).default("(555) 010-0100"),

		BETTER_AUTH_SECRET: secret,
		BETTER_AUTH_URL: z.url({ protocol: /^https?$/ }),
		ACCESS_TOKEN_SECRET: secret,
		ACCESS_TOKEN_EXPIRES_IN: duration,
		REFRESH_TOKEN_SECRET: secret,
		REFRESH_TOKEN_EXPIRES_IN: duration,

		COOKIE_DOMAIN: z
			.string()
			.regex(/^\.?[a-z0-9-]+(\.[a-z0-9-]+)+$/i, 'Must be a domain like ".yourdomain.com"')
			.optional(),

		STRIPE_SECRET_KEY: z.string().startsWith("sk_", 'Must start with "sk_" (Stripe → Developers → API keys)'),
		STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_", 'Must start with "whsec_" (shown by "stripe listen")'),

		SMTP_HOST: z.string().trim().min(1),
		SMTP_PORT: z.coerce.number().int().min(1).max(65535),
		SMTP_USER: z.string().min(1),
		SMTP_PASS: z.string().min(1),
		EMAIL_FROM: z
			.string()
			.trim()
			.regex(/^.+ <[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>$/, 'Must look like "ClinicOS <no-reply@yourdomain.com>"'),
	})
	.superRefine((env, ctx) => {
		if (env.ACCESS_TOKEN_SECRET === env.REFRESH_TOKEN_SECRET) {
			ctx.addIssue({
				code: "custom",
				path: ["REFRESH_TOKEN_SECRET"],
				message: "Must be different from ACCESS_TOKEN_SECRET",
			});
		}
		if (env.NODE_ENV === "production" && !env.BETTER_AUTH_URL.startsWith("https://")) {
			ctx.addIssue({
				code: "custom",
				path: ["BETTER_AUTH_URL"],
				message: "Must use https in production",
			});
		}
	});

const rawEnv = Object.fromEntries(Object.entries(process.env).filter(([, value]) => value !== ""));

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
	console.error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
	process.exit(1);
}

export const envVars = parsed.data;
export const isProduction = envVars.NODE_ENV === "production";
