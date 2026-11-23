import { Button } from "@/components/ui/button";
import { profileHrefFor } from "@/lib/myBooking";
import { UserRoundPen } from "lucide-react";
import Link from "next/link";

// api booking-এর আগে phone, জন্মতারিখ আর gender চায় (isProfileComplete)
export function ProfileIncompleteCard({ returnTo }: { returnTo: string }) {
	return (
		<section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-card md:p-7">
			<span className="flex size-11 items-center justify-center rounded-full bg-warning-soft text-warning-foreground">
				<UserRoundPen className="size-5" aria-hidden="true" />
			</span>
			<div className="flex flex-col gap-1.5">
				<h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Add a few details first</h1>
				<p className="text-[15px] text-body">
					The hospital needs your phone number, date of birth and gender before your first visit. It takes a minute,
					and we&apos;ll bring you straight back to this booking.
				</p>
			</div>
			<Button
				size="lg"
				className="h-11 w-full font-semibold sm:w-fit"
				render={<Link href={profileHrefFor(returnTo)} />}
				nativeButton={false}
			>
				Complete my profile
			</Button>
		</section>
	);
}
