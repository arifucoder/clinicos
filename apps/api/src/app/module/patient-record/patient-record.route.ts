import { ADMINS, STAFF, checkAuth } from "@/app/middleware/checkAuth";
import { validateRequest } from "@/app/middleware/validateRequest";
import { Router } from "express";
import { PatientRecordController } from "./patient-record.controller";
import { PatientRecordValidation } from "./patient-record.validation";

const router = Router();

router.post(
	"/",
	checkAuth(...ADMINS),
	validateRequest(PatientRecordValidation.createPatientSchema),
	PatientRecordController.createPatient,
);

router.get("/", checkAuth(...STAFF), PatientRecordController.getAllPatients);
router.get("/:id", checkAuth(...STAFF), PatientRecordController.getPatientById);

router.patch(
	"/:id",
	checkAuth(...ADMINS),
	validateRequest(PatientRecordValidation.updatePatientSchema),
	PatientRecordController.updatePatient,
);
router.post("/:id/reset-password", checkAuth(...ADMINS), PatientRecordController.resetPassword);
router.patch(
	"/:id/account-status",
	checkAuth(...ADMINS),
	validateRequest(PatientRecordValidation.updateAccountStatusSchema),
	PatientRecordController.updateAccountStatus,
);

export const PatientRecordRoutes = router;
