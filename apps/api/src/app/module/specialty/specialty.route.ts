import { validateRequest } from "@/app/middleware/validateRequest";
import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";
import { SpecialtyValidation } from "./specialty.validation";

const router = Router();

// TODO: auth(Role.ADMIN, Role.SUPER_ADMIN) — Better Auth আসার পর
router.post("/", validateRequest(SpecialtyValidation.createSpecialtySchema), SpecialtyController.createSpecialty);

export const SpecialtyRoutes = router;
