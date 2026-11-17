import { checkAuth } from "@/app/middleware/checkAuth";
import { validateRequest } from "@/app/middleware/validateRequest";
import { Role } from "@/generated/prisma/enums";
import { Router } from "express";
import { AdminController } from "./admin.controller";
import { AdminValidation } from "./admin.validation";

const router = Router();

router.use(checkAuth(Role.SUPER_ADMIN));

router.get("/", AdminController.getAllAdmins);
router.get("/:id", AdminController.getAdminById);

router.patch("/:id", validateRequest(AdminValidation.updateAdminSchema), AdminController.updateAdmin);
router.patch(
	"/:id/status",
	validateRequest(AdminValidation.updateAdminStatusSchema),
	AdminController.updateAdminStatus,
);

router.delete("/:id", AdminController.deleteAdmin);

export const AdminRoutes = router;
