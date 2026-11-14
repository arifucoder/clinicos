import { envVars } from "@/app/config/env";
import { createTransport } from "nodemailer";

export const mailer = createTransport({
	host: envVars.SMTP_HOST,
	port: envVars.SMTP_PORT,
	secure: envVars.SMTP_PORT === 465,
	auth: {
		user: envVars.SMTP_USER,
		pass: envVars.SMTP_PASS,
	},
});
