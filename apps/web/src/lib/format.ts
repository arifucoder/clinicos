const timeZone = process.env.NEXT_PUBLIC_CLINIC_TIME_ZONE;

if (!timeZone) {
	throw new Error("NEXT_PUBLIC_CLINIC_TIME_ZONE is not defined in environment variables");
}

export const CLINIC_TIME_ZONE = timeZone;

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
	day: "2-digit",
	month: "short",
	year: "numeric",
	timeZone: CLINIC_TIME_ZONE,
});

export const formatDate = (iso: string) => dateFormatter.format(new Date(iso));

const moneyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export const formatCents = (cents: number) => moneyFormatter.format(cents / 100);

export const pluralize = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;
