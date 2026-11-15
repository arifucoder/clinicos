import { catchAsync } from "@/app/shared/catchAsync";
import { sendResponse } from "@/app/shared/sendResponse";
import { cookieUtils } from "@/app/utils/cookie";
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

const verifyEmail = catchAsync(async (req, res) => {
	const result = await AuthService.verifyEmail(req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Email verified successfully",
		data: result,
	});
});

const resendOtp = catchAsync(async (req, res) => {
	await AuthService.resendOtp(req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "If an account exists for this email, a new code has been sent",
		data: null,
	});
});

const login = catchAsync(async (req, res) => {
	const { accessToken, refreshToken, sessionToken, user } = await AuthService.login(req.body);

	cookieUtils.setAccessTokenCookie(res, accessToken);
	cookieUtils.setRefreshTokenCookie(res, refreshToken);
	cookieUtils.setSessionCookie(res, sessionToken);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Logged in successfully",
		data: user,
	});
});

export const AuthController = {
	registerPatient,
	verifyEmail,
	resendOtp,
	login,
};
