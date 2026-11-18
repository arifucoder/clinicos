import { checkAuth } from "@/app/middleware/checkAuth";
import { validateRequest } from "@/app/middleware/validateRequest";
import { Role } from "@/generated/prisma/enums";
import { Router } from "express";
import { PatientController } from "./patient.controller";
import { PatientValidation } from "./patient.validation";

const router = Router();

router.use(checkAuth(Role.PATIENT));

router.get("/me", PatientController.getMyProfile);
router.patch("/me", validateRequest(PatientValidation.updateMyProfileSchema), PatientController.updateMyProfile);

export const PatientRoutes = router;
