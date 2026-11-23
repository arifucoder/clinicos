import { ADMINS, checkAuth, STAFF } from "@/app/middleware/checkAuth";
import { validateRequest } from "@/app/middleware/validateRequest";
import { Role } from "@/generated/prisma/enums";
import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import { AppointmentValidation } from "./appointment.validation";

const router = Router();

router.post(
	"/",
	checkAuth(Role.PATIENT, ...ADMINS),
	validateRequest(AppointmentValidation.bookAppointmentSchema),
	AppointmentController.bookAppointment,
);

router.get("/", checkAuth(...STAFF), AppointmentController.getAppointments);
router.get("/:id", checkAuth(...STAFF), AppointmentController.getAppointmentById);

router.patch(
	"/:id/cancel",
	checkAuth(...ADMINS),
	validateRequest(AppointmentValidation.cancelAppointmentSchema),
	AppointmentController.cancelAppointment,
);
router.post(
	"/:id/desk-payment",
	checkAuth(...ADMINS),
	validateRequest(AppointmentValidation.deskPaymentSchema),
	AppointmentController.recordDeskPayment,
);
router.post("/:id/payment-link", checkAuth(...ADMINS), AppointmentController.sendPaymentLink);

router.patch("/:id/check-in", checkAuth(...ADMINS), AppointmentController.checkInAppointment);
router.patch("/:id/undo-check-in", checkAuth(...ADMINS), AppointmentController.undoCheckIn);
router.patch("/:id/no-show", checkAuth(...ADMINS), AppointmentController.markNoShow);
router.patch("/:id/complete", checkAuth(Role.DOCTOR), AppointmentController.completeAppointment);
router.put(
	"/:id/prescription",
	checkAuth(Role.DOCTOR),
	validateRequest(AppointmentValidation.prescriptionSchema),
	AppointmentController.savePrescription,
);

export const AppointmentRoutes = router;

const patientRouter = Router();

patientRouter.use(checkAuth(Role.PATIENT));

patientRouter.get("/", AppointmentController.getMyAppointments);
// "/:id"-এর আগে: নাহলে "periods"-কে id ধরে 400 দিত
patientRouter.get("/periods", AppointmentController.getMyAppointmentPeriods);
patientRouter.get("/:id", AppointmentController.getMyAppointmentById);
patientRouter.patch(
	"/:id/cancel",
	validateRequest(AppointmentValidation.cancelMyAppointmentSchema),
	AppointmentController.cancelMyAppointment,
);
patientRouter.post("/:id/pay", AppointmentController.payMyAppointment);

export const PatientAppointmentRoutes = patientRouter;
