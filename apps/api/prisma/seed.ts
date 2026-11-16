import { envVars } from "@/app/config/env";
import { prisma } from "@/app/lib/prisma";
import { Role } from "@/generated/prisma/enums";
import { hashPassword } from "better-auth/crypto";

const seedSuperAdmin = async () => {
	const { SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } = envVars;

	const superAdminExists = await prisma.user.findFirst({
		where: { role: Role.SUPER_ADMIN },
		select: { id: true },
	});

	if (superAdminExists) {
		console.warn("Super admin already exists, skipping");
		return;
	}

	if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
		throw new Error("Cannot seed super admin: set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in .env");
	}

	const emailTaken = await prisma.user.findUnique({
		where: { email: SUPER_ADMIN_EMAIL },
		select: { role: true },
	});

	if (emailTaken) {
		throw new Error(`Cannot seed super admin: ${SUPER_ADMIN_EMAIL} is already used by a ${emailTaken.role} account`);
	}

	const hashedPassword = await hashPassword(SUPER_ADMIN_PASSWORD);
	const userId = crypto.randomUUID();

	await prisma.$transaction([
		prisma.user.create({
			data: {
				id: userId,
				name: SUPER_ADMIN_NAME,
				email: SUPER_ADMIN_EMAIL,
				role: Role.SUPER_ADMIN,
				emailVerified: true,
				needPasswordChange: false,
			},
		}),
		prisma.account.create({
			data: {
				id: crypto.randomUUID(),
				userId,
				accountId: userId,
				providerId: "credential",
				password: hashedPassword,
			},
		}),
	]);

	console.warn(`Super admin created: ${SUPER_ADMIN_EMAIL}`);
};

try {
	await seedSuperAdmin();
} catch (error) {
	console.error("Seed failed:", error);
	process.exitCode = 1;
} finally {
	await prisma.$disconnect();
}
