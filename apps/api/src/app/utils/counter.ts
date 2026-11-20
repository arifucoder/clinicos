import type { Prisma } from "@/generated/prisma/client";

export const nextCounter = async (tx: Prisma.TransactionClient, key: string): Promise<number> => {
	const counter = await tx.counter.upsert({
		where: { key },
		create: { key, value: 1 },
		update: { value: { increment: 1 } },
		select: { value: true },
	});
	return counter.value;
};
