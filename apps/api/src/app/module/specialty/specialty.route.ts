import { validateRequest } from "@/app/middleware/validateRequest";
import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";
import { SpecialtyValidation } from "./specialty.validation";

const router = Router();

// TODO auth: GET = public (patient-রা দেখবে), POST/PATCH/DELETE = ADMIN, SUPER_ADMIN
router.get("/", SpecialtyController.getAllSpecialties);
router.get("/:id", SpecialtyController.getSpecialtyById);

router.post("/", validateRequest(SpecialtyValidation.createSpecialtySchema), SpecialtyController.createSpecialty);
router.patch("/:id", validateRequest(SpecialtyValidation.updateSpecialtySchema), SpecialtyController.updateSpecialty);
router.delete("/:id", SpecialtyController.deleteSpecialty);

export const SpecialtyRoutes = router;
