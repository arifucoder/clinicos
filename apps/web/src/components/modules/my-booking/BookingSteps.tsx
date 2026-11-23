import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type BookingStepKey = "details" | "payment";

const STEPS = [
	{ key: "account", label: "Account" },
	{ key: "details", label: "Visit details" },
	{ key: "payment", label: "Payment" },
] as const;

export function BookingSteps({ current }: { current: BookingStepKey }) {
	const currentIndex = STEPS.findIndex((step) => step.key === current);

	return (
		<ol aria-label="Booking steps" className="flex items-center gap-2 sm:gap-3">
			{STEPS.map((step, index) => {
				const done = index < currentIndex;
				const active = index === currentIndex;
				return (
					<li
						key={step.key}
						aria-current={active ? "step" : undefined}
						className={cn("flex items-center gap-2 sm:gap-3", index < STEPS.length - 1 && "flex-1")}
					>
						<span
							className={cn(
								"flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold",
								done && "bg-primary text-primary-foreground",
								active && "border-2 border-primary bg-card text-primary ring-4 ring-primary-soft",
								!done && !active && "bg-muted text-muted-foreground",
							)}
						>
							{done ? <Check className="size-4" aria-label="Done" /> : index + 1}
						</span>
						<span
							className={cn(
								"text-[13px] whitespace-nowrap sm:text-sm",
								active ? "font-semibold text-primary" : done ? "font-medium text-foreground" : "text-muted-foreground",
								!active && "hidden sm:inline",
							)}
						>
							{step.label}
						</span>
						{index < STEPS.length - 1 && (
							<span aria-hidden="true" className={cn("h-0.5 flex-1 rounded-full", done ? "bg-primary" : "bg-border")} />
						)}
					</li>
				);
			})}
		</ol>
	);
}
