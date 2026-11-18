import { AppError } from "@/app/errorHelpers/AppError";
import { prisma } from "@/app/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import httpStatus from "http-status";
import type { TUpdateMyProfilePayload } from "./patient.interface";

const myProfileSelect = {
	id: true,
	fullName: true,
	phone: true,
	dateOfBirth: true,
	gender: true,
	address: true,
	bloodGroup: true,
	allergies: true,
	emergencyContactName: true,
	emergencyContactPhone: true,
	createdAt: true,
	updatedAt: true,
	user: { select: { email: true } },
} satisfies Prisma.PatientSelect;

type TMyProfileRow = Prisma.PatientGetPayload<{ select: typeof myProfileSelect }>;

const notDeleted = { user: { isDeleted: false } } satisfies Prisma.PatientWhereInput;

export const isProfileComplete = (patient: Pick<TMyProfileRow, "phone" | "dateOfBirth" | "gender">) =>
	Boolean(patient.phone && patient.dateOfBirth && patient.gender);

const toMyProfile = ({ user, ...patient }: TMyProfileRow) => ({
	...patient,
	email: user.email,
	profileComplete: isProfileComplete(patient),
});

// visits, appointments, queue — পরের সব endpoint এটা দিয়েই শুরু হবে
const getMyPatientOrThrow = async (userId: string) => {
	const patient = await prisma.patient.findFirst({
		where: { userId, ...notDeleted },
		select: { id: true },
	});

	if (!patient) {
		throw new AppError(httpStatus.NOT_FOUND, "Patient profile not found");
	}

	return patient;
};

const getMyProfile = async (userId: string) => {
	const patient = await prisma.patient.findFirst({
		where: { userId, ...notDeleted },
		select: myProfileSelect,
	});

	if (!patient) {
		throw new AppError(httpStatus.NOT_FOUND, "Patient profile not found");
	}

	return toMyProfile(patient);
};

const updateMyProfile = async (userId: string, payload: TUpdateMyProfilePayload) => {
	const { id } = await getMyPatientOrThrow(userId);

	const updated = await prisma.patient.update({
		where: { id },
		data: payload,
		select: myProfileSelect,
	});

	return toMyProfile(updated);
};

export const PatientService = {
	getMyProfile,
	updateMyProfile,
};
