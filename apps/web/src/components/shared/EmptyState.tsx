import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description?: string;
	action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center px-6 py-14 text-center">
			<span className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
				<Icon className="size-6" aria-hidden="true" />
			</span>
			<h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
			{description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
			{action && <div className="mt-5">{action}</div>}
		</div>
	);
}
