import { envVars, isProduction } from "@/app/config/env";
import ejs from "ejs";
import path from "node:path";

const TEMPLATE_DIR = path.join(process.cwd(), "templates", "emails");

export type TEmailTemplates = {
	verificationCode: {
		name: string;
		code: string;
		expiresInMinutes: number;
		expiresAtLabel: string;
	};
	passwordResetCode: {
		name: string;
		code: string;
		expiresInMinutes: number;
		expiresAtLabel: string;
	};
	staffWelcome: {
		name: string;
		roleLabel: string;
		email: string;
		temporaryPassword: string;
		loginUrl: string;
	};
	temporaryPasswordReset: {
		name: string;
		email: string;
		temporaryPassword: string;
		loginUrl: string;
	};
	appointmentConfirmed: {
		name: string;
		appointmentNumber: string;
		doctorName: string;
		whenLabel: string;
		paymentLabel: string;
		portalUrl: string;
	};
	appointmentCancelled: {
		name: string;
		appointmentNumber: string;
		doctorName: string;
		whenLabel: string;
		reason: string;
		refundNote: string | null;
		bookUrl: string;
	};
	paymentLink: {
		name: string;
		appointmentNumber: string;
		doctorName: string;
		whenLabel: string;
		amountLabel: string;
		payUrl: string;
		expiresLabel: string;
	};
};

type TLayoutData = {
	title: string;
	previewText: string;
};

const templatePath = (name: string) => path.join(TEMPLATE_DIR, `${name}.ejs`);

export const renderEmail = async <T extends keyof TEmailTemplates>(
	template: T,
	data: TEmailTemplates[T],
	layout: TLayoutData,
): Promise<string> => {
	const common = {
		clinicName: envVars.CLINIC_NAME,
		clinicAddress: envVars.CLINIC_ADDRESS,
		clinicPhone: envVars.CLINIC_PHONE,
		year: new Date().getFullYear(),
	};
	const options = { cache: isProduction };

	const bodyHtml = await ejs.renderFile(templatePath(template), { ...common, ...data }, options);

	return ejs.renderFile(templatePath("layout"), { ...common, ...layout, bodyHtml }, options);
};
