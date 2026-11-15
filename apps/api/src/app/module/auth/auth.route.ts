import { checkAuth } from "@/app/middleware/checkAuth";
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
router.post(
	"/verify-email",
	authRateLimiter,
	validateRequest(AuthValidation.verifyEmailSchema),
	AuthController.verifyEmail,
);
router.post("/resend-otp", authRateLimiter, validateRequest(AuthValidation.resendOtpSchema), AuthController.resendOtp);

router.post("/login", authRateLimiter, validateRequest(AuthValidation.loginSchema), AuthController.login);
router.get("/me", checkAuth(), AuthController.getMe);
router.post("/refresh-token", AuthController.refreshTokens);

export const AuthRoutes = router;
