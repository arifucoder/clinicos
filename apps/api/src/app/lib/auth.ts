import { envVars } from "@/app/config/env";
import { prisma } from "@/app/lib/prisma";
import { sendEmail } from "@/app/shared/sendEmail";
import { Role } from "@/generated/prisma/enums";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";

const OTP_EXPIRES_MINUTES = 2;

const formatClinicTime = (date: Date) =>
	new Intl.DateTimeFormat("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: envVars.CLINIC_TIME_ZONE,
	}).format(date);

export const auth = betterAuth({
	baseURL: envVars.BETTER_AUTH_URL,
	secret: envVars.BETTER_AUTH_SECRET,

	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),

	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
	},

	user: {
		additionalFields: {
			role: { type: "string", input: false, defaultValue: Role.PATIENT },
			isActive: { type: "boolean", input: false, defaultValue: true },
			needPasswordChange: { type: "boolean", input: false, defaultValue: false },
		},
	},

	plugins: [
		emailOTP({
			otpLength: 6,
			expiresIn: OTP_EXPIRES_MINUTES * 60,
			allowedAttempts: 3,
			storeOTP: "hashed",
			overrideDefaultEmailVerification: true,

			async sendVerificationOTP({ email, otp, type }) {
				if (type !== "email-verification") return;

				const user = await prisma.user.findUnique({
					where: { email },
					select: { name: true },
				});

				const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60_000);

				// await নেই: response-এর সময় দেখে যেন বোঝা না যায় email-টা আছে কিনা
				void sendEmail({
					to: email,
					subject: `${otp} is your ${envVars.CLINIC_NAME} verification code`,
					previewText: `Use this code to verify your email. It expires in ${OTP_EXPIRES_MINUTES} minutes.`,
					template: "verificationCode",
					data: {
						name: user?.name ?? "there",
						code: otp,
						expiresInMinutes: OTP_EXPIRES_MINUTES,
						expiresAtLabel: formatClinicTime(expiresAt),
					},
				}).catch((error: unknown) => {
					console.error("Failed to send verification email", error);
				});
			},
		}),
	],

	advanced: {
		database: {
			generateId: () => crypto.randomUUID(),
		},
	},
});
