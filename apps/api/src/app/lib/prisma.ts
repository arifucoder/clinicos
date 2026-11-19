import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { envVars } from "../config/env";

const adapter = new PrismaPg({ connectionString: envVars.DATABASE_URL });

export const prisma = new PrismaClient({
	adapter,
	// Remote DB (Neon) ধীর হতে পারে: cold start + দূরের region
	transactionOptions: {
		maxWait: 10_000, // connection পেতে সর্বোচ্চ ১০ সেকেন্ড অপেক্ষা (ডিফল্ট ২ সেকেন্ড)
		timeout: 15_000, // পুরো transaction সর্বোচ্চ ১৫ সেকেন্ড (ডিফল্ট ৫ সেকেন্ড)
	},
});
