import { Skeleton } from "@/components/ui/skeleton";

export function DataTableSkeleton({ rows = 8, columns = 5 }: { rows?: number; columns?: number }) {
	return (
		<div className="overflow-hidden rounded-xl border border-border bg-card shadow-card" aria-hidden="true">
			<div className="flex gap-2 border-b border-border p-4">
				<Skeleton className="h-9 w-72" />
				<Skeleton className="h-8 w-24 rounded-full" />
			</div>
			<div className="flex gap-6 bg-surface px-4 py-3">
				{Array.from({ length: columns }, (_, index) => (
					<Skeleton key={index} className="h-3 flex-1" />
				))}
			</div>
			{Array.from({ length: rows }, (_, row) => (
				<div key={row} className="flex h-15 items-center gap-6 border-t border-border/60 px-4">
					{Array.from({ length: columns }, (_, column) => (
						<Skeleton key={column} className="h-4 flex-1" />
					))}
				</div>
			))}
		</div>
	);
}
