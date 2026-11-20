import { ADMINS, checkAuth } from "@/app/middleware/checkAuth";
import { Role } from "@/generated/prisma/enums";
import { Router } from "express";
import { StatsController } from "./stats.controller";

// ---------- /stats (staff) ----------
const router = Router();

router.get("/admin", checkAuth(...ADMINS), StatsController.getAdminStats);
router.get("/doctor", checkAuth(Role.DOCTOR), StatsController.getDoctorStats);

export const StatsRoutes = router;

// ---------- /patient/stats (রোগী নিজে; patientId session থেকে) ----------
const patientRouter = Router();

patientRouter.get("/", checkAuth(Role.PATIENT), StatsController.getPatientStats);

export const PatientStatsRoutes = patientRouter;
