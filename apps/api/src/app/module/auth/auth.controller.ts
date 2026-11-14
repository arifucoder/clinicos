import { catchAsync } from "@/app/shared/catchAsync";
import { sendResponse } from "@/app/shared/sendResponse";
import httpStatus from "http-status";
import { AuthService } from "./auth.service";

const registerPatient = catchAsync(async (req, res) => {
	const result = await AuthService.registerPatient(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		message: "Account created. Check your email for the verification code",
		data: result,
	});
});

export const AuthController = {
	registerPatient,
};
