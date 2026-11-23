import { CLINIC_TIME_ZONE } from "@/lib/format";
import type { MyPatientProfile } from "@/types/patient.types";

const hourFormatter = new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: CLINIC_TIME_ZONE });
const longDateFormatter = new Intl.DateTimeFormat("en-GB", {
	weekday: "long",
	day: "numeric",
	month: "long",
	timeZone: CLINIC_TIME_ZONE,
});

export const greetingFor = (now: Date) => {
	const hour = Number(hourFormatter.format(now));
	if (hour < 5) return "Good evening"; // রাত ১২–৫টা: ২৪/৭ hospital, "morning" অদ্ভুত শোনায়
	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";
	return "Good evening";
};

export const formatLongClinicDate = (now: Date) => longDateFormatter.format(now);

export interface DateTileParts {
	weekday: string; // "MON"
	day: string; // "23"
	month: string; // "Nov"
}

const tileFormatter = (timeZone: string) =>
	new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone });

const toTileParts = (formatter: Intl.DateTimeFormat, date: Date): DateTileParts => {
	const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
	return { weekday: (parts.weekday ?? "").toUpperCase(), day: parts.day ?? "", month: parts.month ?? "" };
};

const clinicTileFormatter = tileFormatter(CLINIC_TIME_ZONE);
const utcTileFormatter = tileFormatter("UTC");

export const tileFromInstant = (iso: string) => toTileParts(clinicTileFormatter, new Date(iso));
export const tileFromCalendarDate = (iso: string) => toTileParts(utcTileFormatter, new Date(iso));

const REQUIRED_FIELDS = [
	{ key: "phone", label: "phone number" },
	{ key: "dateOfBirth", label: "date of birth" },
	{ key: "gender", label: "gender" },
] as const;
const OPTIONAL_FIELDS = ["address", "bloodGroup", "emergencyContactName", "emergencyContactPhone"] as const;

export const profileCompleteness = (profile: MyPatientProfile) => {
	const filled = [...REQUIRED_FIELDS.map((field) => field.key), ...OPTIONAL_FIELDS].filter(
		(key) => profile[key] !== null && profile[key] !== "",
	).length;
	const total = REQUIRED_FIELDS.length + OPTIONAL_FIELDS.length;
	const missingRequired = REQUIRED_FIELDS.filter((field) => !profile[field.key]).map((field) => field.label);

	return { percent: Math.round((filled / total) * 100), missingRequired };
};

export const joinWithAnd = (items: readonly string[]) => {
	const text = items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
	return text.charAt(0).toUpperCase() + text.slice(1);
};
