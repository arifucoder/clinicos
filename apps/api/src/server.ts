import type { Server } from "node:http";
import app from "./app";
import { envVars } from "./app/config/env";

const PORT = envVars.PORT;
const SHUTDOWN_TIMEOUT_MS = 10_000;

let server: Server | undefined;

const startServer = () => {
	server = app.listen(PORT, (error) => {
		if (error) {
			console.error("Failed to start server:", error);
			process.exit(1);
		}
		console.info(`ClinicOS API running on http://localhost:${PORT}`);
	});
};

const shutdown = (signal: NodeJS.Signals) => {
	console.info(`${signal} received, shutting down gracefully...`);

	if (!server) {
		process.exit(0);
	}

	server.close((error) => {
		if (error) {
			console.error("Error during shutdown:", error);
			process.exit(1);
		}
		console.info("Server closed");
		process.exit(0);
	});

	setTimeout(() => {
		console.error("Forced shutdown after timeout");
		process.exit(1);
	}, SHUTDOWN_TIMEOUT_MS).unref();
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

process.on("unhandledRejection", (reason) => {
	console.error("Unhandled rejection:", reason);
	process.exit(1);
});

process.on("uncaughtException", (error) => {
	console.error("Uncaught exception:", error);
	process.exit(1);
});

startServer();
