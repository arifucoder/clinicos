import type { Request, Response } from "express";
import express from "express";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AppRoutes } from "./app/routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
	res.json({ message: "ClinicOS API is running" });
});

app.get("/api/v1/health", (_req: Request, res: Response) => {
	res.json({
		status: "ok",
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
	});
});

app.use("/api/v1", AppRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
