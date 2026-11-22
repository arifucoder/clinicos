import type { ReactNode } from "react";

interface PageHeaderProps {
	title: string;
	count?: number;
	actions?: ReactNode;
}

export function PageHeader({ title, count, actions }: PageHeaderProps) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-3">
			<div className="flex items-center gap-3">
				<h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-[28px]">{title}</h1>
				{count !== undefined && (
					<span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[13px] font-semibold text-body tabular-nums">
						{count.toLocaleString("en-US")}
					</span>
				)}
			</div>
			{actions && <div className="flex items-center gap-2">{actions}</div>}
		</div>
	);
}
