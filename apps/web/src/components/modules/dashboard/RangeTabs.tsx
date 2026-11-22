import { cn } from "@/lib/utils";
import { STATS_RANGES } from "@/zod/stats.validation";
import Link from "next/link";

export function RangeTabs({ days }: { days: number }) {
	return (
		<nav aria-label="Date range" className="inline-flex rounded-lg border border-border bg-card p-1">
			{STATS_RANGES.map((range) => {
				const isActive = range === days;
				return (
					<Link
						key={range}
						href={`/admin?days=${range}`}
						scroll={false}
						aria-current={isActive ? "page" : undefined}
						className={cn(
							"rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
							isActive ? "bg-primary-soft text-primary" : "text-muted-foreground hover:text-foreground",
						)}
					>
						{range} days
					</Link>
				);
			})}
		</nav>
	);
}
