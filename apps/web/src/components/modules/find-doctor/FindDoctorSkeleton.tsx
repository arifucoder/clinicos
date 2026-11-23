import { Skeleton } from "@/components/ui/skeleton";

export function FindDoctorSkeleton() {
	return (
		<div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8" aria-busy="true">
			<Skeleton className="hidden h-120 rounded-xl lg:block" />
			<div className="flex flex-col gap-4">
				<div className="flex items-end justify-between gap-3">
					<div className="space-y-2">
						<Skeleton className="h-6 w-56" />
						<Skeleton className="h-4 w-40" />
					</div>
					<Skeleton className="hidden h-10 w-48 sm:block" />
				</div>
				<Skeleton className="h-10 w-full lg:hidden" />
				{Array.from({ length: 4 }, (_, index) => (
					<div key={index} className="flex gap-4 rounded-xl border border-border bg-card p-4 sm:gap-5 sm:px-6 sm:py-5">
						<Skeleton className="size-14 shrink-0 rounded-full sm:size-18" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-5 w-48" />
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-4 w-full max-w-md" />
						</div>
						<Skeleton className="hidden h-24 w-50 sm:block" />
					</div>
				))}
			</div>
		</div>
	);
}
