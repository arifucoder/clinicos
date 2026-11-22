import { catchAsync } from "@/app/shared/catchAsync";
import { idParamSchema } from "@/app/shared/commonValidation";
import { getAuthUser } from "@/app/shared/getAuthUser";
import { sendResponse } from "@/app/shared/sendResponse";
import httpStatus from "http-status";
import { AppointmentService } from "./appointment.service";
import { AppointmentValidation } from "./appointment.validation";

const bookAppointment = catchAsync(async (req, res) => {
	const result = await AppointmentService.bookAppointment(getAuthUser(req), req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		message: result.checkoutUrl ? "Appointment held — complete the payment within 30 minutes" : "Appointment booked",
		data: result,
	});
});

const getAppointments = catchAsync(async (req, res) => {
	const { date } = AppointmentValidation.listQuerySchema.parse(req.query);
	const { meta, data } = await AppointmentService.getAppointments(getAuthUser(req), req.query, date);

	sendResponse(res, { statusCode: httpStatus.OK, message: "Appointments retrieved successfully", meta, data });
});

const getAppointmentById = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await AppointmentService.getAppointmentById(getAuthUser(req), id);

	sendResponse(res, { statusCode: httpStatus.OK, message: "Appointment retrieved successfully", data: result });
});

const cancelAppointment = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await AppointmentService.cancelAppointment(getAuthUser(req), id, req.body);

	sendResponse(res, { statusCode: httpStatus.OK, message: "Appointment cancelled", data: result });
});

const recordDeskPayment = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await AppointmentService.recordDeskPayment(getAuthUser(req), id, req.body);

	sendResponse(res, { statusCode: httpStatus.OK, message: "Consultation fee received", data: result });
});

const sendPaymentLink = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await AppointmentService.sendPaymentLink(id);

	sendResponse(res, { statusCode: httpStatus.OK, message: "Payment link sent to the patient", data: result });
});

const checkInAppointment = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await AppointmentService.checkInAppointment(getAuthUser(req), id);

	sendResponse(res, { statusCode: httpStatus.OK, message: "Patient checked in", data: result });
});

const completeAppointment = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await AppointmentService.completeAppointment(getAuthUser(req), id);

	sendResponse(res, { statusCode: httpStatus.OK, message: "Appointment completed", data: result });
});

const savePrescription = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await AppointmentService.savePrescription(getAuthUser(req), id, req.body);

	sendResponse(res, { statusCode: httpStatus.OK, message: "Prescription saved", data: result });
});

const markNoShow = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await AppointmentService.markNoShow(id);

	sendResponse(res, { statusCode: httpStatus.OK, message: "Marked as no-show", data: result });
});

const getMyAppointments = catchAsync(async (req, res) => {
	const { meta, data } = await AppointmentService.getMyAppointments(getAuthUser(req).userId, req.query);

	sendResponse(res, { statusCode: httpStatus.OK, message: "Appointments retrieved successfully", meta, data });
});

const getMyAppointmentById = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await AppointmentService.getMyAppointmentById(getAuthUser(req).userId, id);

	sendResponse(res, { statusCode: httpStatus.OK, message: "Appointment retrieved successfully", data: result });
});

const cancelMyAppointment = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await AppointmentService.cancelMyAppointment(getAuthUser(req).userId, id, req.body);

	sendResponse(res, { statusCode: httpStatus.OK, message: "Appointment cancelled", data: result });
});

const payMyAppointment = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await AppointmentService.payMyAppointment(getAuthUser(req).userId, id);

	sendResponse(res, { statusCode: httpStatus.OK, message: "Checkout created", data: result });
});
const undoCheckIn = catchAsync(async (req, res) => {
	const { id } = idParamSchema.parse(req.params);
	const result = await AppointmentService.undoCheckIn(id);

	sendResponse(res, { statusCode: httpStatus.OK, message: "Check-in undone", data: result });
});
export const AppointmentController = {
	bookAppointment,
	getAppointments,
	getAppointmentById,
	cancelAppointment,
	recordDeskPayment,
	sendPaymentLink,
	checkInAppointment,
	completeAppointment,
	savePrescription,
	markNoShow,
	getMyAppointments,
	getMyAppointmentById,
	cancelMyAppointment,
	payMyAppointment,
	undoCheckIn,
};
