import { catchAsync } from "@/app/shared/catchAsync";
import { getAuthUser } from "@/app/shared/getAuthUser";
import { sendResponse } from "@/app/shared/sendResponse";
import httpStatus from "http-status";
import { SlotService } from "./slot.service";
import { SlotValidation } from "./slot.validation";

const openSlots = catchAsync(async (req, res) => {
	const { doctorId } = SlotValidation.doctorParamSchema.parse(req.params);
	const result = await SlotService.openSlots(getAuthUser(req), doctorId, req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		message: `${result.created} slots opened`,
		data: result,
	});
});

const getPublicSlots = catchAsync(async (req, res) => {
	const { doctorId } = SlotValidation.publicDoctorParamSchema.parse(req.params);
	const query = SlotValidation.publicSlotQuerySchema.parse(req.query);
	const result = await SlotService.getPublicSlots(doctorId, query);

	sendResponse(res, { statusCode: httpStatus.OK, message: "Slots retrieved successfully", data: result });
});

const getManageSlots = catchAsync(async (req, res) => {
	const { doctorId } = SlotValidation.doctorParamSchema.parse(req.params);
	const query = SlotValidation.manageSlotQuerySchema.parse(req.query);
	const result = await SlotService.getManageSlots(getAuthUser(req), doctorId, query);

	sendResponse(res, { statusCode: httpStatus.OK, message: "Slots retrieved successfully", data: result });
});

const blockSlots = catchAsync(async (req, res) => {
	const { doctorId } = SlotValidation.doctorParamSchema.parse(req.params);
	const result = await SlotService.blockSlots(getAuthUser(req), doctorId, req.body);

	sendResponse(res, { statusCode: httpStatus.OK, message: `${result.blocked} slots blocked`, data: result });
});

const unblockSlots = catchAsync(async (req, res) => {
	const { doctorId } = SlotValidation.doctorParamSchema.parse(req.params);
	const result = await SlotService.unblockSlots(getAuthUser(req), doctorId, req.body);

	sendResponse(res, { statusCode: httpStatus.OK, message: `${result.unblocked} slots unblocked`, data: result });
});

const deleteSlot = catchAsync(async (req, res) => {
	const { doctorId, slotId } = SlotValidation.slotParamSchema.parse(req.params);
	await SlotService.deleteSlot(getAuthUser(req), doctorId, slotId);

	sendResponse(res, { statusCode: httpStatus.OK, message: "Slot deleted successfully", data: null });
});

export const SlotController = {
	openSlots,
	getPublicSlots,
	getManageSlots,
	blockSlots,
	unblockSlots,
	deleteSlot,
};
