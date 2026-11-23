import { Skeleton } from "@/components/ui/skeleton";
import { BOOKING_WINDOW_DAYS } from "@/lib/findDoctor";
import { getDoctorTotal, getHomeSpecialties } from "@/lib/homeData";
import { Suspense } from "react";
import { sectionClass } from "./homeStyles";

const statClass = "flex flex-col gap-1.5 py-2 md:px-8 md:first:pl-0 md:last:pr-0";
const numberClass = "font-heading text-4xl leading-none font-bold tracking-[-0.03em] text-foreground md:text-[44px]";

// design-এর "40+ doctors", "12 min wait" ছিল demo সংখ্যা → এখানে আসল সংখ্যা (api থেকে) বা আসল নিয়ম (config)
export function AtAGlance() {
	return (
		<section aria-label="At a glance" className={`${sectionClass} py-14 md:py-16`}>
			<div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 md:gap-0 md:divide-x md:divide-border">
				<div className={statClass}>
					<span className={numberClass}>24/7</span>
					<span className="text-[15px] text-body">Open every day, including holidays</span>
				</div>
				<Suspense fallback={<Skeleton className="h-20 w-full" />}>
					<DoctorStat />
				</Suspense>
				<div className={statClass}>
					<span className={numberClass}>
						{BOOKING_WINDOW_DAYS}
						<span className="text-2xl font-semibold tracking-normal"> days</span>
					</span>
					<span className="text-[15px] text-body">Book up to two weeks ahead</span>
				</div>
				<div className={statClass}>
					<span className="font-heading text-[26px] leading-11 font-bold tracking-[-0.02em] text-foreground md:text-3xl">
						Online or desk
					</span>
					<span className="text-[15px] text-body">Pay the way that suits you</span>
				</div>
			</div>
		</section>
	);
}

async function DoctorStat() {
	const [total, specialties] = await Promise.all([
		getDoctorTotal().catch(() => null),
		getHomeSpecialties().catch(() => []),
	]);

	return (
		<div className={statClass}>
			<span className={numberClass}>{total ?? "—"}</span>
			<span className="text-[15px] text-body">
				{total === 1 ? "Doctor" : "Doctors"} across {specialties.length}{" "}
				{specialties.length === 1 ? "specialty" : "specialties"}
			</span>
		</div>
	);
}
