import { Skeleton } from "@/components/ui/skeleton";

export function DoctorProfileSkeleton() {
	return (
		<div className="flex flex-col gap-5" aria-busy="true">
			<Skeleton className="h-4 w-72" />
			<div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-8">
				<div className="flex flex-col gap-5">
					<Skeleton className="h-56 rounded-xl" />
					<Skeleton className="h-40 rounded-xl" />
					<Skeleton className="h-96 rounded-xl" />
				</div>
				<Skeleton className="hidden h-150 rounded-xl lg:block" />
			</div>
		</div>
	);
}
