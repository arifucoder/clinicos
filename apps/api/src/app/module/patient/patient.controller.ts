import { catchAsync } from "@/app/shared/catchAsync";
import { getAuthUser } from "@/app/shared/getAuthUser";
import { sendResponse } from "@/app/shared/sendResponse";
import httpStatus from "http-status";
import { PatientService } from "./patient.service";

const getMyProfile = catchAsync(async (req, res) => {
	const { userId } = getAuthUser(req);
	const result = await PatientService.getMyProfile(userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Profile retrieved successfully",
		data: result,
	});
});

const updateMyProfile = catchAsync(async (req, res) => {
	const { userId } = getAuthUser(req);
	const result = await PatientService.updateMyProfile(userId, req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Profile updated successfully",
		data: result,
	});
});

export const PatientController = {
	getMyProfile,
	updateMyProfile,
};
