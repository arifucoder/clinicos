// api-র CLINIC_TIME_ZONE-এর সাথে একই মান রাখো (SDLC 7.4)।
// NEXT_PUBLIC_: client component-এও লাগে; build-এর সময় code-এ বসে যায়।
// process.env.NEXT_PUBLIC_X এভাবে পুরো নাম লিখতে হয় — destructure করলে Next বদলাতে পারে না।
const timeZone = process.env.NEXT_PUBLIC_CLINIC_TIME_ZONE;

if (!timeZone) {
	throw new Error("NEXT_PUBLIC_CLINIC_TIME_ZONE is not defined in environment variables");
}

// ভুল নাম ("Asia/Dhka") হলে Intl নিজেই RangeError দেয় → শুরুতেই ধরা পড়ে
export const CLINIC_TIME_ZONE = timeZone;

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
	day: "2-digit",
	month: "short",
	year: "numeric",
	timeZone: CLINIC_TIME_ZONE,
});

export const formatDate = (iso: string) => dateFormatter.format(new Date(iso));
