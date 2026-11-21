import { Skeleton } from "@/components/ui/skeleton";

const STAT_CARD_COUNT = 4;
const TABLE_ROW_COUNT = 6;

export default function DashboardLoading() {
	return (
		<div role="status" aria-busy="true" className="mx-auto w-full max-w-7xl p-5 md:p-8">
			<span className="sr-only">Loading…</span>

			<div aria-hidden="true" className="space-y-6">
				{/* Page header */}
				<div className="space-y-2">
					<Skeleton className="h-7 w-48 bg-border" />
					<Skeleton className="h-4 w-72 max-w-full bg-border" />
				</div>

				{/* Stat cards */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: STAT_CARD_COUNT }, (_, i) => (
						<div key={i} className="rounded-xl border border-border bg-card p-5 shadow-card">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="mt-3 h-8 w-16" />
						</div>
					))}
				</div>

				{/* Table */}
				<div className="rounded-xl border border-border bg-card shadow-card">
					<div className="flex items-center justify-between gap-4 border-b border-border p-4">
						<Skeleton className="h-5 w-40" />
						<Skeleton className="h-9 w-56 max-w-[50%]" />
					</div>

					<div className="divide-y divide-border">
						{Array.from({ length: TABLE_ROW_COUNT }, (_, i) => (
							<div key={i} className="flex items-center gap-4 px-4 py-3">
								<Skeleton className="size-9 shrink-0 rounded-full" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-4 w-1/3" />
									<Skeleton className="h-3 w-1/4" />
								</div>
								<Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
