import { catchAsync } from "@/app/shared/catchAsync";
import { idParamSchema } from "@/app/shared/commonValidation";
import { sendResponse } from "@/app/shared/sendResponse";
import httpStatus from "http-status";
import { AdminService } from "./admin.service";

const getAllAdmins = catchAsync(async (req, res) => {
	const { meta, data } = await AdminService.getAllAdmins(req.query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Admins retrieved successfully",
		meta,
		data,
	});
});

const getAdminById = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await AdminService.getAdminById(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Admin retrieved successfully",
		data: result,
	});
});

const updateAdmin = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await AdminService.updateAdmin(id, req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Admin updated successfully",
		data: result,
	});
});

const updateAdminStatus = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await AdminService.updateAdminStatus(id, req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: result.isActive ? "Admin activated" : "Admin deactivated and signed out",
		data: result,
	});
});

const deleteAdmin = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	await AdminService.deleteAdmin(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Admin deleted successfully",
		data: null,
	});
});

export const AdminController = {
	getAllAdmins,
	getAdminById,
	updateAdmin,
	updateAdminStatus,
	deleteAdmin,
};
