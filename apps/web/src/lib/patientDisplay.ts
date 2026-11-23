import type { BloodGroup, Gender } from "@/types/patient.types";

export const GENDER_LABEL: Record<Gender, string> = { MALE: "Male", FEMALE: "Female", OTHER: "Other" };

export const BLOOD_GROUP_LABEL: Record<BloodGroup, string> = {
	A_POSITIVE: "A+",
	A_NEGATIVE: "A−",
	B_POSITIVE: "B+",
	B_NEGATIVE: "B−",
	AB_POSITIVE: "AB+",
	AB_NEGATIVE: "AB−",
	O_POSITIVE: "O+",
	O_NEGATIVE: "O−",
};

const dateOnlyFormatter = new Intl.DateTimeFormat("en-GB", {
	day: "2-digit",
	month: "short",
	year: "numeric",
	timeZone: "UTC",
});
export const formatDateOfBirth = (iso: string) => dateOnlyFormatter.format(new Date(iso));

export const ageFromDateOfBirth = (iso: string, today: string) => {
	const [by, bm, bd] = [iso.slice(0, 4), iso.slice(5, 7), iso.slice(8, 10)].map(Number);
	const [ty, tm, td] = [today.slice(0, 4), today.slice(5, 7), today.slice(8, 10)].map(Number);
	const hadBirthday = tm! > bm! || (tm === bm && td! >= bd!);
	return ty! - by! - (hadBirthday ? 0 : 1);
};
