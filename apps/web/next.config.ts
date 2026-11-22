import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	cacheComponents: true,
	partialPrefetching: true,
	// পুরনো "Today" page (/admin/front-desk) সরানো হয়েছে → bookmark থাকলে appointments-এ পাঠাই
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
