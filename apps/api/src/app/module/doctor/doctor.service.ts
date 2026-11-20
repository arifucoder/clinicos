import { envVars } from "@/app/config/env";
import { SLOT_CONFIG } from "@/app/config/slot.config";
import { AppError } from "@/app/errorHelpers/AppError";
import { prisma } from "@/app/lib/prisma";
import { buildListQuery, buildMeta } from "@/app/shared/query/queryBuilder";
import { deleteImageQuietly, uploadImage } from "@/app/utils/storage";
import type { Prisma } from "@/generated/prisma/client";
import { SlotStatus } from "@/generated/prisma/enums";
import httpStatus from "http-status";
import { activeAppointmentWhere } from "../appointment/appointment.helpers";
import { addDaysToDate, clinicDateOf, clinicDayStartUtc } from "../slot/slot.utils";
import { doctorListConfig, publicDoctorListConfig } from "./doctor.constant";
import type {
	TPublicDoctorQuery,
	TUpdateDoctorPayload,
	TUpdateDoctorStatusPayload,
	TUpdateMyProfilePayload,
} from "./doctor.interface";

const TZ = envVars.CLINIC_TIME_ZONE;

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

const updateMyProfile = async (userId: string, payload: TUpdateMyProfilePayload) => {
	const { name, phone, bio } = payload;

	const doctor = await prisma.doctorProfile.findFirst({
		where: { userId, ...notDeleted },
		select: { id: true },
	});

	if (!doctor) {
		throw new AppError(httpStatus.NOT_FOUND, "Doctor profile not found");
	}

	const updated = await prisma.$transaction(async (tx) => {
		if (name !== undefined || phone !== undefined) {
			await tx.user.update({
				where: { id: userId },
				data: { name, phone },
			});
		}

		return tx.doctorProfile.update({
			where: { id: doctor.id },
			data: { bio },
			select: doctorSelect,
		});
	});

	return toDoctorResponse(updated);
};

// ---------- Photo ----------

const DOCTOR_PHOTO_FOLDER = "clinicos/doctors";

const findMyDoctorIdOrThrow = async (userId: string) => {
	const doctor = await prisma.doctorProfile.findFirst({
		where: { userId, ...notDeleted },
		select: { id: true },
	});

	if (!doctor) {
		throw new AppError(httpStatus.NOT_FOUND, "Doctor profile not found");
	}

	return doctor.id;
};

const findPhotoPublicIdOrThrow = async (id: string) => {
	const doctor = await prisma.doctorProfile.findFirst({
		where: { id, ...notDeleted },
		select: { photoPublicId: true },
	});

	if (!doctor) {
		throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");
	}

	return doctor.photoPublicId;
};

// ক্রম: নতুন ছবি upload → DB update → পুরনো ছবি মোছা
const setDoctorPhoto = async (id: string, photo: Buffer) => {
	const oldPublicId = await findPhotoPublicIdOrThrow(id);

	const uploaded = await uploadImage(photo, DOCTOR_PHOTO_FOLDER);

	// DB update fail করলে নতুন ছবিটা অনাথ হয়ে থাকবে, তাই সেটা মুছে error ফেরত
	const updated = await prisma.doctorProfile
		.update({
			where: { id },
			data: { photoUrl: uploaded.url, photoPublicId: uploaded.publicId },
			select: doctorSelect,
		})
		.catch(async (error: unknown) => {
			await deleteImageQuietly(uploaded.publicId);
			throw error;
		});

	await deleteImageQuietly(oldPublicId);

	return toDoctorResponse(updated);
};

const removeDoctorPhoto = async (id: string) => {
	const oldPublicId = await findPhotoPublicIdOrThrow(id);

	const updated = await prisma.doctorProfile.update({
		where: { id },
		data: { photoUrl: null, photoPublicId: null },
		select: doctorSelect,
	});

	await deleteImageQuietly(oldPublicId);

	return toDoctorResponse(updated);
};

// Doctor নিজে: id session থেকে, client থেকে না (IDOR-safe)
const setMyPhoto = async (userId: string, photo: Buffer) => setDoctorPhoto(await findMyDoctorIdOrThrow(userId), photo);

const removeMyPhoto = async (userId: string) => removeDoctorPhoto(await findMyDoctorIdOrThrow(userId));

// ---------- Public (login লাগে না) ----------

// Public-এ শুধু এগুলো যাবে। email, phone, licenseNumber, isActive যাবে না
const publicDoctorSelect = {
	id: true,
	consultationFeeCents: true,
	roomNumber: true,
	bio: true,
	photoUrl: true,
	user: { select: { name: true } },
	doctorSpecialties: {
		where: { specialty: { isActive: true, isDeleted: false } },
		select: { specialty: { select: { name: true, slug: true, icon: true } } },
	},
} satisfies Prisma.DoctorProfileSelect;

type TPublicDoctorRow = Prisma.DoctorProfileGetPayload<{ select: typeof publicDoctorSelect }>;

const toPublicDoctor = ({ user, doctorSpecialties, ...doctor }: TPublicDoctorRow, nextAvailableAt: Date | null) => ({
	...doctor,
	name: user.name,
	specialties: doctorSpecialties.map(({ specialty }) => specialty),
	nextAvailableAt,
});

// Deleted বা deactivated doctor public-এ দেখা যাবে না
const publicDoctorWhere = {
	user: { isDeleted: false, isActive: true },
} satisfies Prisma.DoctorProfileWhereInput;

// কোন সময়ের slot খোঁজা হবে: date দিলে শুধু সেই দিন, না দিলে পুরো booking window
const resolveSlotRange = (now: Date, date?: string) => {
	const today = clinicDateOf(now, TZ);
	const lastBookableDate = addDaysToDate(today, SLOT_CONFIG.bookingWindowDays - 1);

	if (date && (date < today || date > lastBookableDate)) {
		throw new AppError(httpStatus.BAD_REQUEST, `Pick a date between ${today} and ${lastBookableDate}`);
	}

	const from = date ?? today;
	const to = date ?? lastBookableDate;

	return {
		today,
		range: { gte: clinicDayStartUtc(from, TZ), lt: clinicDayStartUtc(addDaysToDate(to, 1), TZ) },
	};
};

// "রোগী এখন book করতে পারবে" এমন slot: getPublicSlots আর createAppointment-এর নিয়মের সাথে মিল রেখে
const bookableSlotWhere = (now: Date, date?: string): Prisma.DoctorSlotWhereInput => {
	const { today, range } = resolveSlotRange(now, date);
	const earliest = new Date(now.getTime() + SLOT_CONFIG.minLeadMinutes * 60_000);
	const tomorrowStart = clinicDayStartUtc(addDaysToDate(today, 1), TZ);

	return {
		status: SlotStatus.OPEN,
		AND: [
			{ startAt: range },
			{ startAt: { gte: earliest } },
			{ appointments: { none: activeAppointmentWhere(now) } },
			// Paused doctor-এর আজকের slot book করা যায় না (appointment.service-এর নিয়ম)
			{ OR: [{ doctor: { isPaused: false } }, { startAt: { gte: tomorrowStart } }] },
		],
	};
};

const getPublicDoctors = async (rawQuery: unknown, query: TPublicDoctorQuery) => {
	const now = new Date();
	const slotWhere = bookableSlotWhere(now, query.date);

	// date দিলে শুধু সেই দিনে খালি slot আছে এমন doctor
	const baseWhere: Prisma.DoctorProfileWhereInput = query.date
		? { ...publicDoctorWhere, slots: { some: slotWhere } }
		: publicDoctorWhere;

	const q = buildListQuery(rawQuery, publicDoctorListConfig, baseWhere);

	const [rows, total] = await Promise.all([
		prisma.doctorProfile.findMany({ ...q.args, select: publicDoctorSelect }),
		prisma.doctorProfile.count({ where: q.where }),
	]);

	// সব doctor-এর "পরের খালি slot" একটা query-তেই আসে (N+1 হয় না)
	const doctorIds = rows.map((row) => row.id);
	const nextSlots =
		doctorIds.length === 0
			? []
			: await prisma.doctorSlot.groupBy({
					by: ["doctorId"],
					where: { ...slotWhere, doctorId: { in: doctorIds } },
					_min: { startAt: true },
				});

	const nextByDoctor = new Map(nextSlots.map((slot) => [slot.doctorId, slot._min.startAt]));

	return {
		meta: buildMeta(total, q.page, q.limit),
		data: rows.map((row) => toPublicDoctor(row, nextByDoctor.get(row.id) ?? null)),
	};
};

const getPublicDoctorById = async (id: string) => {
	const doctor = await prisma.doctorProfile.findFirst({
		where: { id, ...publicDoctorWhere },
		select: publicDoctorSelect,
	});

	if (!doctor) {
		throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");
	}

	const nextSlot = await prisma.doctorSlot.findFirst({
		where: { ...bookableSlotWhere(new Date()), doctorId: id },
		orderBy: { startAt: "asc" },
		select: { startAt: true },
	});

	return toPublicDoctor(doctor, nextSlot?.startAt ?? null);
};

export const DoctorService = {
	getAllDoctors,
	getDoctorById,
	updateDoctor,
	updateDoctorStatus,
	deleteDoctor,
	updateMyProfile,
	getPublicDoctors,
	getPublicDoctorById,
	setDoctorPhoto,
	removeDoctorPhoto,
	setMyPhoto,
	removeMyPhoto,
};
