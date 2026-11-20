import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { envVars } from "../config/env";

const adapter = new PrismaPg({ connectionString: envVars.DATABASE_URL });

export const prisma = new PrismaClient({
	adapter,
	transactionOptions: {
		maxWait: 10_000,
		timeout: 15_000,
	},
});
