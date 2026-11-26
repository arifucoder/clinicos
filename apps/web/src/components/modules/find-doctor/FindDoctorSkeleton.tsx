import { Skeleton } from "@/components/ui/skeleton";

export function FindDoctorSkeleton() {
	return (
		<div className="flex flex-col gap-5" aria-busy="true">
			<div className="flex items-center justify-between gap-3 border-b border-border pb-4">
				<Skeleton className="h-10 w-56 rounded-lg" />
				<Skeleton className="hidden h-5 w-32 md:block" />
				<Skeleton className="h-10 w-48" />
			</div>
			<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
				{Array.from({ length: 6 }, (_, index) => (
					<DoctorCardSkeleton key={index} />
				))}
			</div>
		</div>
	);
}

export function DoctorCardSkeleton() {
	return (
		<div className="overflow-hidden rounded-xl border border-border bg-card">
			<div className="flex gap-4 p-5">
				<Skeleton className="h-36 w-27 shrink-0 rounded-lg" />
				<div className="flex-1 space-y-2.5">
					<Skeleton className="h-5 w-40" />
					<Skeleton className="h-5 w-24" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-32" />
				</div>
			</div>
			<Skeleton className="h-17 rounded-none" />
		</div>
	);
}
