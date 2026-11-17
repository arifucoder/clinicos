import { AppError } from "@/app/errorHelpers/AppError";
import { prisma } from "@/app/lib/prisma";
import { buildListQuery, buildMeta } from "@/app/shared/query/queryBuilder";
import type { Prisma } from "@/generated/prisma/client";
import httpStatus from "http-status";
import { doctorListConfig } from "./doctor.constant";
import type { TUpdateDoctorPayload, TUpdateDoctorStatusPayload } from "./doctor.interface";

const doctorSelect = {
	id: true,
	licenseNumber: true,
	consultationFeeCents: true,
	roomNumber: true,
	bio: true,
	photoUrl: true,
	isPaused: true,
	createdAt: true,
	updatedAt: true,
	user: {
		select: { id: true, name: true, email: true, phone: true, isActive: true, needPasswordChange: true },
	},
	doctorSpecialties: {
		select: { specialty: { select: { id: true, name: true, slug: true } } },
	},
} satisfies Prisma.DoctorProfileSelect;

type TDoctorRow = Prisma.DoctorProfileGetPayload<{ select: typeof doctorSelect }>;

const toDoctorResponse = ({ doctorSpecialties, ...doctor }: TDoctorRow) => ({
	...doctor,
	specialties: doctorSpecialties.map(({ specialty }) => specialty),
});

const notDeleted = { user: { isDeleted: false } } satisfies Prisma.DoctorProfileWhereInput;

const findDoctorOrThrow = async (id: string) => {
	const doctor = await prisma.doctorProfile.findFirst({
		where: { id, ...notDeleted },
		select: doctorSelect,
	});

	if (!doctor) {
		throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");
	}

	return doctor;
};

const getAllDoctors = async (rawQuery: unknown) => {
	const q = buildListQuery(rawQuery, doctorListConfig, notDeleted);

	const [rows, total] = await Promise.all([
		prisma.doctorProfile.findMany({ ...q.args, select: doctorSelect }),
		prisma.doctorProfile.count({ where: q.where }),
	]);

	return { meta: buildMeta(total, q.page, q.limit), data: rows.map(toDoctorResponse) };
};

const getDoctorById = async (id: string) => {
	return toDoctorResponse(await findDoctorOrThrow(id));
};

const updateDoctor = async (id: string, payload: TUpdateDoctorPayload) => {
	const { name, phone, specialtyIds, licenseNumber, ...profileData } = payload;

	const doctor = await findDoctorOrThrow(id);

	if (specialtyIds) {
		const validSpecialtyCount = await prisma.specialty.count({
			where: { id: { in: specialtyIds }, isDeleted: false, isActive: true },
		});

		if (validSpecialtyCount !== specialtyIds.length) {
			throw new AppError(httpStatus.BAD_REQUEST, "One or more specialties are not found or inactive");
		}
	}

	if (licenseNumber && licenseNumber !== doctor.licenseNumber) {
		const licenseTaken = await prisma.doctorProfile.findUnique({
			where: { licenseNumber },
			select: { id: true },
		});

		if (licenseTaken) {
			throw new AppError(httpStatus.CONFLICT, "A doctor with this license number already exists");
		}
	}

	const updated = await prisma.$transaction(async (tx) => {
		if (name !== undefined || phone !== undefined) {
			await tx.user.update({
				where: { id: doctor.user.id },
				data: { name, phone },
			});
		}

		if (specialtyIds) {
			await tx.doctorSpecialty.deleteMany({ where: { doctorProfileId: id } });
			await tx.doctorSpecialty.createMany({
				data: specialtyIds.map((specialtyId) => ({ doctorProfileId: id, specialtyId })),
			});
		}

		return tx.doctorProfile.update({
			where: { id },
			data: { ...profileData, licenseNumber },
			select: doctorSelect,
		});
	});

	return toDoctorResponse(updated);
};

const updateDoctorStatus = async (id: string, payload: TUpdateDoctorStatusPayload) => {
	const { isActive } = payload;

	const doctor = await findDoctorOrThrow(id);

	const updated = await prisma.$transaction(async (tx) => {
		await tx.user.update({
			where: { id: doctor.user.id },
			data: { isActive },
		});

		if (!isActive) {
			await tx.session.deleteMany({ where: { userId: doctor.user.id } });
		}

		return tx.doctorProfile.findUniqueOrThrow({
			where: { id },
			select: doctorSelect,
		});
	});

	return toDoctorResponse(updated);
};

const deleteDoctor = async (id: string) => {
	const doctor = await findDoctorOrThrow(id);

	await prisma.$transaction([
		prisma.user.update({
			where: { id: doctor.user.id },
			data: { isDeleted: true, deletedAt: new Date(), isActive: false },
		}),
		prisma.session.deleteMany({ where: { userId: doctor.user.id } }),
	]);
};

export const DoctorService = {
	getAllDoctors,
	getDoctorById,
	updateDoctor,
	updateDoctorStatus,
	deleteDoctor,
};
