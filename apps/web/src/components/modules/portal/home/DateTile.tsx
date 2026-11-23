import type { DateTileParts } from "@/lib/portalHome";
import { cn } from "cn";

export function DateTile({ parts, tone = "primary" }: { parts: DateTileParts; tone?: "primary" | "muted" }) {
	return (
		<div
			aria-hidden="true"
			className={cn(
				"flex w-14 shrink-0 flex-col items-center overflow-hidden rounded-lg border text-center",
				tone === "primary" ? "border-primary/20 bg-primary-soft" : "border-border bg-muted",
			)}
		>
			<span
				className={cn(
					"w-full py-0.5 text-[10px] font-semibold tracking-wide",
					tone === "primary" ? "bg-primary text-primary-foreground" : "bg-slate-200 text-body",
				)}
			>
				{parts.weekday}
			</span>
			<span className="font-heading text-xl leading-7 font-bold text-foreground tabular-nums">{parts.day}</span>
			<span className="pb-1 text-[11px] text-muted-foreground">{parts.month}</span>
		</div>
	);
}
