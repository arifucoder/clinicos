import { Skeleton } from "@/components/ui/skeleton";

// doctor আর portal দুই print page-এর loading অবস্থা
export function PrintSkeleton() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-8 w-40" />
			<Skeleton className="h-8 w-72" />
			<div className="grid gap-6 lg:grid-cols-[1fr_300px]">
				<Skeleton className="h-[900px] rounded-xl" />
				<Skeleton className="h-52 rounded-xl" />
			</div>
		</div>
	);
}
