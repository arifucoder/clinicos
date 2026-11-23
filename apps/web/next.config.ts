import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	cacheComponents: true,
	partialPrefetching: true,
	experimental: {
		serverActions: { bodySizeLimit: "3mb" },
	},
	async redirects() {
		return [{ source: "/admin/front-desk", destination: "/admin/front-desk/appointments", permanent: false }];
	},
	turbopack: {
		rules: {
			"*.css": {
				loaders: ["@tailwindcss/turbopack"],
				as: "*.css",
			},
		},
	},
};

export default nextConfig;
