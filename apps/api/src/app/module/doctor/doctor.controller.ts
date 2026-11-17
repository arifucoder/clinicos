import { catchAsync } from "@/app/shared/catchAsync";
import { idParamSchema } from "@/app/shared/commonValidation";
import { sendResponse } from "@/app/shared/sendResponse";
import httpStatus from "http-status";
import { DoctorService } from "./doctor.service";

const getAllDoctors = catchAsync(async (req, res) => {
	const { meta, data } = await DoctorService.getAllDoctors(req.query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Doctors retrieved successfully",
		meta,
		data,
	});
});

const getDoctorById = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await DoctorService.getDoctorById(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Doctor retrieved successfully",
		data: result,
	});
});

const updateDoctor = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await DoctorService.updateDoctor(id, req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Doctor updated successfully",
		data: result,
	});
});

const updateDoctorStatus = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await DoctorService.updateDoctorStatus(id, req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: result.user.isActive ? "Doctor activated" : "Doctor deactivated and signed out",
		data: result,
	});
});

const deleteDoctor = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	await DoctorService.deleteDoctor(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Doctor deleted successfully",
		data: null,
	});
});

export const DoctorController = {
	getAllDoctors,
	getDoctorById,
	updateDoctor,
	updateDoctorStatus,
	deleteDoctor,
};
