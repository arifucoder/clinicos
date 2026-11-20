export const formatMoney = (cents: number, currency: string): string =>
	new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
