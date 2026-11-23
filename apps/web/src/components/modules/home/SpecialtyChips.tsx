import { Skeleton } from "@/components/ui/skeleton";
import { FIND_DOCTOR_PATH } from "@/lib/findDoctor";
import { getHomeSpecialties } from "@/lib/homeData";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { eyebrowClass, h2Class, sectionClass } from "./homeStyles";
import { SpecialtyIcon } from "./SpecialtyIcon";

export function SpecialtyChips() {
	return (
		<section id="services" aria-labelledby="specialties-heading" className={`${sectionClass} scroll-mt-24 pt-14 pb-6 md:pt-16`}>
			<div className="mb-5 flex items-end justify-between gap-4">
				<div className="flex flex-col gap-1.5">
					<p className={eyebrowClass}>Specialties</p>
					<h2 id="specialties-heading" className={h2Class}>
						What do you need help with?
					</h2>
				</div>
				<Link
					href={FIND_DOCTOR_PATH}
					className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
				>
					View all
					<ArrowRight className="size-4" aria-hidden="true" />
				</Link>
			</div>
			<Suspense fallback={<ChipsSkeleton />}>
				<ChipList />
			</Suspense>
		</section>
	);
}

async function ChipList() {
	const specialties = await getHomeSpecialties().catch(() => []);
	if (specialties.length === 0) {
		return <p className="text-sm text-muted-foreground">Specialties will appear here soon.</p>;
	}

	return (
		<ul className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
			{specialties.map((specialty) => (
				<li key={specialty.slug} className="shrink-0">
					<Link
						href={`${FIND_DOCTOR_PATH}?specialty=${specialty.slug}`}
						className="flex h-12 items-center gap-2.5 rounded-full border border-border bg-card pr-4 pl-2 text-sm font-medium whitespace-nowrap text-foreground shadow-card transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
					>
						<span className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-primary">
							<SpecialtyIcon name={specialty.icon} className="size-4" />
						</span>
						{specialty.name}
						<span className="text-xs text-muted-foreground tabular-nums">{specialty.doctorCount}</span>
					</Link>
				</li>
			))}
		</ul>
	);
}

function ChipsSkeleton() {
	return (
		<div className="flex gap-2.5 overflow-hidden">
			{Array.from({ length: 6 }, (_, index) => (
				<Skeleton key={index} className="h-12 w-40 shrink-0 rounded-full" />
			))}
		</div>
	);
}
