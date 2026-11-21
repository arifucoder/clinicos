import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
	subsets: ["latin"],
	weight: ["600", "700"],
	variable: "--font-jakarta",
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		default: "ClinicOS General Hospital",
		template: "%s · ClinicOS",
	},
	description: "Book a doctor online, 24/7. Pay online or at the front desk and see your prescriptions on your phone.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className={cn("h-full antialiased", inter.variable, jakarta.variable)}>
			<body className="flex min-h-full flex-col">{children}</body>
		</html>
	);
}
