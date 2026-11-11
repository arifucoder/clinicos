import { catchAsync } from "@/app/shared/catchAsync";
import { idParamSchema } from "@/app/shared/commonValidation";
import { sendResponse } from "@/app/shared/sendResponse";
import httpStatus from "http-status";
import { SpecialtyService } from "./specialty.service";

const createSpecialty = catchAsync(async (req, res) => {
	const result = await SpecialtyService.createSpecialty(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		message: "Specialty created successfully",
		data: result,
	});
});

const getAllSpecialties = catchAsync(async (req, res) => {
	const { meta, data } = await SpecialtyService.getAllSpecialties(req.query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Specialties retrieved successfully",
		meta,
		data,
	});
});

const getSpecialtyById = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await SpecialtyService.getSpecialtyById(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Specialty retrieved successfully",
		data: result,
	});
});

const updateSpecialty = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await SpecialtyService.updateSpecialty(id, req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Specialty updated successfully",
		data: result,
	});
});

const deleteSpecialty = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	await SpecialtyService.deleteSpecialty(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Specialty deleted successfully",
		data: null,
	});
});

export const SpecialtyController = {
	createSpecialty,
	getAllSpecialties,
	getSpecialtyById,
	updateSpecialty,
	deleteSpecialty,
};
