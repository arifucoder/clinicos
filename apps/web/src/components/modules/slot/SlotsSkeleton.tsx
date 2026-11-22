import { Skeleton } from "@/components/ui/skeleton";
import { BOARD_DAYS } from "@/zod/slot.validation";
import { cn } from "cn";

// admin: picker + week nav; doctor: শুধু week nav
export function SlotsSkeleton({ withPicker = false }: { withPicker?: boolean }) {
	return (
		<div className="space-y-5">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-56" />
				<Skeleton className="h-10 w-32" />
			</div>
			<div className={cn("flex flex-wrap gap-3", withPicker ? "justify-between" : "sm:justify-end")}>
				{withPicker && <Skeleton className="h-9 w-80" />}
				<Skeleton className="h-9 w-64" />
			</div>
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
				{Array.from({ length: BOARD_DAYS }, (_, index) => (
					<Skeleton key={index} className="h-64 rounded-xl" />
				))}
			</div>
		</div>
	);
}
