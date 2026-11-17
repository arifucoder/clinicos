import { catchAsync } from "@/app/shared/catchAsync";
import { sendResponse } from "@/app/shared/sendResponse";
import httpStatus from "http-status";
import { UserService } from "./user.service";

const createAdmin = catchAsync(async (req, res) => {
	const result = await UserService.createAdmin(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		message: result.emailSent
			? "Admin created. Login details have been sent to their email"
			: "Admin created, but the welcome email could not be sent. Reset their password to send it again",
		data: result,
	});
});

const createDoctor = catchAsync(async (req, res) => {
	const result = await UserService.createDoctor(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		message: result.emailSent
			? "Doctor created. Login details have been sent to their email"
			: "Doctor created, but the welcome email could not be sent. Reset their password to send it again",
		data: result,
	});
});

export const UserController = {
	createAdmin,
	createDoctor,
};
