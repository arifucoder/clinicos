import { ADMINS, checkAuth } from "@/app/middleware/checkAuth";
import { validateRequest } from "@/app/middleware/validateRequest";
import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";
import { SpecialtyValidation } from "./specialty.validation";

const router = Router();

router.get("/", SpecialtyController.getAllSpecialties);
router.get("/:id", SpecialtyController.getSpecialtyById);

router.post(
	"/",
	checkAuth(...ADMINS),
	validateRequest(SpecialtyValidation.createSpecialtySchema),
	SpecialtyController.createSpecialty,
);
router.patch(
	"/:id",
	checkAuth(...ADMINS),
	validateRequest(SpecialtyValidation.updateSpecialtySchema),
	SpecialtyController.updateSpecialty,
);
router.delete("/:id", checkAuth(...ADMINS), SpecialtyController.deleteSpecialty);

export const SpecialtyRoutes = router;
