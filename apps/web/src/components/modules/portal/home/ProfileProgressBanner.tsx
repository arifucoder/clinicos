import { Button } from "@/components/ui/button";
import { joinWithAnd } from "@/lib/portalHome";
import { UserRound } from "lucide-react";
import Link from "next/link";

interface ProfileProgressBannerProps {
	percent: number;
	missingRequired: string[];
}

// booking-এর আগে phone, জন্মতারিখ, gender লাগে → না থাকলে উপরে দেখাই
export function ProfileProgressBanner({ percent, missingRequired }: ProfileProgressBannerProps) {
	return (
		<section
			aria-label="Profile completeness"
			className="flex flex-col gap-3 rounded-xl border border-primary/15 bg-primary-soft/60 p-4 sm:flex-row sm:items-center"
		>
			<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-card text-primary">
				<UserRound className="size-5" aria-hidden="true" />
			</span>
			<div className="min-w-0 flex-1 space-y-2">
				<div>
					<p className="text-sm font-semibold text-foreground">Your profile is {percent}% complete</p>
					<p className="text-xs text-body">
						{joinWithAnd(missingRequired)} {missingRequired.length === 1 ? "is" : "are"} needed before you can book.
					</p>
				</div>
				<div
					role="progressbar"
					aria-valuenow={percent}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label="Profile completeness"
					className="h-1.5 w-full max-w-64 overflow-hidden rounded-full bg-card"
				>
					<div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
				</div>
			</div>
			<Button variant="outline" render={<Link href="/portal/profile" />} nativeButton={false} className="shrink-0">
				Complete profile
			</Button>
		</section>
	);
}
