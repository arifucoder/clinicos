import { SpecialtyRoutes } from "@/app/module/specialty/specialty.route";
import { Router } from "express";
import { AuthRoutes } from "../module/auth/auth.route";

const router = Router();

const moduleRoutes = [
	{ path: "/auth", route: AuthRoutes },
	{ path: "/specialties", route: SpecialtyRoutes },
];

for (const { path, route } of moduleRoutes) {
	router.use(path, route);
}

export const AppRoutes = router;
