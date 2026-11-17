import { checkAuth } from "@/app/middleware/checkAuth";
import { validateRequest } from "@/app/middleware/validateRequest";
import { Role } from "@/generated/prisma/enums";
import { Router } from "express";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";

const router = Router();

router.post(
	"/admins",
	checkAuth(Role.SUPER_ADMIN),
	validateRequest(UserValidation.createAdminSchema),
	UserController.createAdmin,
);

export const UserRoutes = router;
