import { SpecialtyRoutes } from "@/app/module/specialty/specialty.route";
import { Router } from "express";
import { AdminRoutes } from "../module/admin/admin.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { DoctorRoutes } from "../module/doctor/doctor.route";
import { PatientRecordRoutes } from "../module/patient-record/patient-record.route";
import { PatientRoutes } from "../module/patient/patient.route";
import { SlotRoutes } from "../module/slot/slot.route";
import { UserRoutes } from "../module/user/user.route";

const router = Router();

const moduleRoutes = [
	{ path: "/auth", route: AuthRoutes },
	{ path: "/specialties", route: SpecialtyRoutes },
	{ path: "/users", route: UserRoutes },
	{ path: "/admins", route: AdminRoutes },
	{ path: "/doctors/:doctorId/slots", route: SlotRoutes },
	{ path: "/doctors", route: DoctorRoutes },
	{ path: "/patient-records", route: PatientRecordRoutes },
	{ path: "/patient", route: PatientRoutes },
];

for (const { path, route } of moduleRoutes) {
	router.use(path, route);
}

export const AppRoutes = router;
