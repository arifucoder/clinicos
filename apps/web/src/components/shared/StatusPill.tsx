import { cn } from "cn";
import type { ReactNode } from "react";

// design: teal = active/live, blue = info/invited, gray = নেই, amber = waiting, rose = danger
const tones = {
	success: { pill: "bg-success-soft text-success-foreground", dot: "bg-success" },
	info: { pill: "bg-primary-soft text-primary-hover", dot: "bg-primary" },
	neutral: { pill: "bg-muted text-body", dot: "bg-slate-400" },
	warning: { pill: "bg-warning-soft text-warning-foreground", dot: "bg-warning" },
	danger: { pill: "bg-danger-soft text-danger-foreground", dot: "bg-danger" },
} as const;

export type StatusTone = keyof typeof tones;

export function StatusPill({ tone, children }: { tone: StatusTone; children: ReactNode }) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
				tones[tone].pill,
			)}
		>
			<span aria-hidden="true" className={cn("size-1.5 rounded-full", tones[tone].dot)} />
			{children}
		</span>
	);
}
