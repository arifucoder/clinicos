import type { Request, Response } from "express";
import express from "express";

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

export default app;
