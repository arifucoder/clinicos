import type { Prisma } from "@/generated/prisma/client";

// Atomic counter: upsert + increment একটাই SQL (INSERT ... ON CONFLICT DO UPDATE)।
// দুটো transaction একসাথে এলে Postgres row lock একটার পর একটা চালায় → duplicate নম্বর হয় না।
export const nextCounter = async (tx: Prisma.TransactionClient, key: string): Promise<number> => {
	const counter = await tx.counter.upsert({
		where: { key },
		create: { key, value: 1 },
		update: { value: { increment: 1 } },
		select: { value: true },
	});
	return counter.value;
};
