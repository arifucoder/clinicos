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
