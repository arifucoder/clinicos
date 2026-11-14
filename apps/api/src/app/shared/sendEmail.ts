import { envVars } from "@/app/config/env";
import { mailer } from "@/app/lib/mailer";
import { renderEmail, type TEmailTemplates } from "./renderEmail";

type TSendEmailOptions<T extends keyof TEmailTemplates> = {
	to: string;
	subject: string;
	previewText: string;
	template: T;
	data: TEmailTemplates[T];
};

export const sendEmail = async <T extends keyof TEmailTemplates>(options: TSendEmailOptions<T>) => {
	const { to, subject, previewText, template, data } = options;

	const html = await renderEmail(template, data, { title: subject, previewText });

	await mailer.sendMail({
		from: envVars.EMAIL_FROM,
		to,
		subject,
		html,
	});
};
