import { SpecialtyRoutes } from "@/app/module/specialty/specialty.route";
import { Router } from "express";

const router = Router();

const moduleRoutes = [{ path: "/specialties", route: SpecialtyRoutes }];

for (const { path, route } of moduleRoutes) {
	router.use(path, route);
}

export const AppRoutes = router;
