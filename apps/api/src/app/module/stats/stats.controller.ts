import { catchAsync } from "@/app/shared/catchAsync";
import { getAuthUser } from "@/app/shared/getAuthUser";
import { sendResponse } from "@/app/shared/sendResponse";
import httpStatus from "http-status";
import { StatsService } from "./stats.service";
import { StatsValidation } from "./stats.validation";

const getAdminStats = catchAsync(async (req, res) => {
	const { days } = StatsValidation.adminStatsQuerySchema.parse(req.query);
	const result = await StatsService.getAdminStats(days);

	sendResponse(res, { statusCode: httpStatus.OK, message: "Admin stats retrieved successfully", data: result });
});

const getDoctorStats = catchAsync(async (req, res) => {
	const result = await StatsService.getDoctorStats(getAuthUser(req).userId);

	sendResponse(res, { statusCode: httpStatus.OK, message: "Doctor stats retrieved successfully", data: result });
});

const getPatientStats = catchAsync(async (req, res) => {
	const result = await StatsService.getPatientStats(getAuthUser(req).userId);

	sendResponse(res, { statusCode: httpStatus.OK, message: "Patient stats retrieved successfully", data: result });
});

export const StatsController = { getAdminStats, getDoctorStats, getPatientStats };
