import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const toneClass = {
	primary: "text-primary",
	warning: "text-warning",
	success: "text-success",
	danger: "text-danger",
} as const;

export interface StatItem {
	label: string;
	value: string;
	icon: LucideIcon;
	tone: keyof typeof toneClass;
}

export function StatGrid({ items, className }: { items: StatItem[]; className?: string }) {
	return (
		<dl className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6", className)}>
			{items.map(({ label, value, icon: Icon, tone }) => (
				<div key={label} className="rounded-xl border border-border bg-card p-4 shadow-card">
					<dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
						<Icon className={cn("size-4", toneClass[tone])} aria-hidden="true" />
						{label}
					</dt>
					<dd className="mt-2 font-heading text-2xl font-bold text-foreground tabular-nums">{value}</dd>
				</div>
			))}
		</dl>
	);
}
