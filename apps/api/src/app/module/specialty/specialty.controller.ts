import { catchAsync } from "@/app/shared/catchAsync";
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

export const SpecialtyController = { createSpecialty };
