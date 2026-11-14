import { authRateLimiter } from "@/app/middleware/rateLimiter";
import { validateRequest } from "@/app/middleware/validateRequest";
import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post(
	"/register",
	authRateLimiter,
	validateRequest(AuthValidation.registerSchema),
	AuthController.registerPatient,
);

export const AuthRoutes = router;
