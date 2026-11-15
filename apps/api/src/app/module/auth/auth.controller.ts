import { AppError } from "@/app/errorHelpers/AppError";
import { catchAsync } from "@/app/shared/catchAsync";
import { getAuthUser } from "@/app/shared/getAuthUser";
import { sendResponse } from "@/app/shared/sendResponse";
import { COOKIE_NAMES, cookieUtils } from "@/app/utils/cookie";
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

const getMe = catchAsync(async (req, res) => {
	const { userId } = getAuthUser(req);
	const result = await AuthService.getMe(userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Profile retrieved successfully",
		data: result,
	});
});

const refreshTokens = catchAsync(async (req, res) => {
	const refreshToken = cookieUtils.getCookie(req, COOKIE_NAMES.refreshToken);
	const sessionToken = cookieUtils.getCookie(req, COOKIE_NAMES.session);

	if (!refreshToken || !sessionToken) {
		throw new AppError(httpStatus.UNAUTHORIZED, "You are not logged in");
	}

	const result = await AuthService.refreshTokens(refreshToken, sessionToken);

	cookieUtils.setAccessTokenCookie(res, result.accessToken);
	cookieUtils.setRefreshTokenCookie(res, result.refreshToken);
	cookieUtils.setSessionCookie(res, result.sessionToken);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Session refreshed successfully",
		data: null,
	});
});

export const AuthController = {
	registerPatient,
	verifyEmail,
	resendOtp,
	login,
	getMe,
	refreshTokens,
};
