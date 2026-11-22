import { Skeleton } from "@/components/ui/skeleton";

// user fetch হওয়ার আগে এক ঝলক: একই কাঠামো, তাই layout লাফাবে না
export function DashboardShellSkeleton() {
	return (
		<div role="status" aria-busy="true" className="flex min-h-svh flex-1 bg-canvas">
			<span className="sr-only">Loading…</span>
			<div aria-hidden="true" className="hidden w-62 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
				<div className="h-16 border-b border-canvas" />
				<div className="space-y-2 p-4">
					{Array.from({ length: 6 }, (_, i) => (
						<Skeleton key={i} className="h-9 w-full" />
					))}
				</div>
			</div>
			<div aria-hidden="true" className="flex flex-1 flex-col">
				<div className="h-14 border-b border-border bg-card md:h-16" />
			</div>
		</div>
	);
}
