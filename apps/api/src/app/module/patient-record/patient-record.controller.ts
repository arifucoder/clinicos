import { catchAsync } from "@/app/shared/catchAsync";
import { idParamSchema } from "@/app/shared/commonValidation";
import { getAuthUser } from "@/app/shared/getAuthUser";
import { sendResponse } from "@/app/shared/sendResponse";
import httpStatus from "http-status";
import { PatientRecordService } from "./patient-record.service";

const createPatient = catchAsync(async (req, res) => {
	const { userId } = getAuthUser(req);
	const result = await PatientRecordService.createPatient(userId, req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		message: result.emailSent
			? "Patient registered. Login details have been sent to their email"
			: "Patient registered, but the welcome email could not be sent. Give them the temporary password shown here",
		data: result,
	});
});

const getAllPatients = catchAsync(async (req, res) => {
	const { meta, data } = await PatientRecordService.getAllPatients(req.query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Patients retrieved successfully",
		meta,
		data,
	});
});

const getPatientById = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await PatientRecordService.getPatientById(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Patient retrieved successfully",
		data: result,
	});
});

const updatePatient = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await PatientRecordService.updatePatient(id, req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Patient updated successfully",
		data: result,
	});
});

const resetPassword = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await PatientRecordService.resetPassword(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: result.emailSent
			? "Password reset. The new temporary password has been sent to their email"
			: "Password reset, but the email could not be sent. Give them the temporary password shown here",
		data: result,
	});
});

const updateAccountStatus = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await PatientRecordService.updateAccountStatus(id, req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: result.user.isActive ? "Patient account activated" : "Patient account deactivated and signed out",
		data: result,
	});
});

export const PatientRecordController = {
	createPatient,
	getAllPatients,
	getPatientById,
	updatePatient,
	resetPassword,
	updateAccountStatus,
};
