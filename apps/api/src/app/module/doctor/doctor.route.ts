import { ADMINS, checkAuth } from "@/app/middleware/checkAuth";
import { validateRequest } from "@/app/middleware/validateRequest";
import { Router } from "express";
import { DoctorController } from "./doctor.controller";
import { DoctorValidation } from "./doctor.validation";

const router = Router();

router.use(checkAuth(...ADMINS));

router.get("/", DoctorController.getAllDoctors);
router.get("/:id", DoctorController.getDoctorById);

router.patch("/:id", validateRequest(DoctorValidation.updateDoctorSchema), DoctorController.updateDoctor);
router.patch(
	"/:id/status",
	validateRequest(DoctorValidation.updateDoctorStatusSchema),
	DoctorController.updateDoctorStatus,
);

router.delete("/:id", DoctorController.deleteDoctor);

export const DoctorRoutes = router;
