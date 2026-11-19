import { ADMINS, checkAuth, STAFF } from "@/app/middleware/checkAuth";
import { validateRequest } from "@/app/middleware/validateRequest";
import { Role } from "@/generated/prisma/enums";
import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import { AppointmentValidation } from "./appointment.validation";

// ---------- /appointments (রোগী book করে; বাকি সব staff) ----------
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

export const AppointmentRoutes = router;

// ---------- /patient/appointments (শুধু রোগী নিজে; patientId সবসময় session থেকে) ----------
const patientRouter = Router();

patientRouter.use(checkAuth(Role.PATIENT));

patientRouter.get("/", AppointmentController.getMyAppointments);
patientRouter.get("/:id", AppointmentController.getMyAppointmentById);
patientRouter.patch(
	"/:id/cancel",
	validateRequest(AppointmentValidation.cancelMyAppointmentSchema),
	AppointmentController.cancelMyAppointment,
);
patientRouter.post("/:id/pay", AppointmentController.payMyAppointment);

export const PatientAppointmentRoutes = patientRouter;
