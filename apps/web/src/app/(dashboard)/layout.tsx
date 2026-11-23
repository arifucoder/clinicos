import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardShellSkeleton } from "@/components/layout/DashboardShellSkeleton";
import { Topbar } from "@/components/layout/Topbar";
import { getCurrentUser } from "@/lib/currentUser";
import { toShellUser } from "@/lib/userDisplay";
import { redirect } from "next/navigation";
import { type ReactNode, Suspense } from "react";

export default function DashboardLayout({ children }: LayoutProps<"/">) {
	// cacheComponents: cookie পড়া (request data) অবশ্যই Suspense-এর ভেতরে থাকতে হবে
	return (
		<Suspense fallback={<DashboardShellSkeleton />}>
			<DashboardShell>{children}</DashboardShell>
		</Suspense>
	);
}

async function DashboardShell({ children }: { children: ReactNode }) {
	const me = await getCurrentUser();
	if (!me) redirect("/session-expired");

	const user = toShellUser(me);

	return (
		<div className="flex min-h-svh flex-1 bg-canvas print:bg-white">
			<a
				href="#main"
				className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
			>
				Skip to content
			</a>

			<AppSidebar user={user} />

			<div className="flex min-w-0 flex-1 flex-col">
				<Topbar user={user} />
				<main id="main" className="flex-1 px-4 py-5 md:px-8 md:pt-6 md:pb-8 print:p-0">
					{children}
				</main>
			</div>
		</div>
	);
}
