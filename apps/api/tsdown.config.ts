import { defineConfig } from "tsdown";

export default defineConfig({
	entry: { server: "src/server.ts", seed: "prisma/seed.ts", "seed-demo": "prisma/seed-demo.ts" },
	format: "esm",
	platform: "node",
	target: "node24",
	outDir: "dist",
	clean: true,
	sourcemap: true,
	fixedExtension: false,
});
