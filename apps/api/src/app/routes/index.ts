import { SpecialtyRoutes } from "@/app/module/specialty/specialty.route";
import { Router } from "express";
import { AdminRoutes } from "../module/admin/admin.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRoutes } from "../module/user/user.route";

const router = Router();

const moduleRoutes = [
	{ path: "/auth", route: AuthRoutes },
	{ path: "/specialties", route: SpecialtyRoutes },
	{ path: "/users", route: UserRoutes },
	{ path: "/admins", route: AdminRoutes },
];

for (const { path, route } of moduleRoutes) {
	router.use(path, route);
}

export const AppRoutes = router;
