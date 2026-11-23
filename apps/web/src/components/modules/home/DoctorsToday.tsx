import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatClinicTime } from "@/lib/clinicDate";
import { FIND_DOCTOR_PATH } from "@/lib/findDoctor";
import { formatCents } from "@/lib/format";
import { getDoctorsToday } from "@/lib/homeData";
import { getInitials } from "@/lib/userDisplay";
import type { PublicDoctor } from "@/types/doctor.types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { h2Class, sectionClass } from "./homeStyles";

const SHOWN = 4;

export function DoctorsToday() {
	return (
		<section aria-labelledby="today-heading" className={`${sectionClass} pt-10 pb-18 md:pt-12 md:pb-24`}>
			<div className="mb-5 flex flex-wrap items-end justify-between gap-4">
				<div className="flex flex-col gap-1.5">
					<span className="flex h-6 w-fit items-center gap-1.5 rounded-full bg-teal-50 px-2.5 text-xs font-medium text-teal-700">
						<span aria-hidden="true" className="size-1.5 rounded-full bg-teal-600 motion-safe:animate-live-pulse" />
						Open slots right now
					</span>
					<h2 id="today-heading" className={h2Class}>
						Doctors available today
					</h2>
				</div>
				<Button
					variant="outline"
					className="h-10 bg-card font-semibold"
					render={<Link href={FIND_DOCTOR_PATH} />}
					nativeButton={false}
				>
					See all doctors
					<ArrowRight />
				</Button>
			</div>
			<Suspense fallback={<CardsSkeleton />}>
				<DoctorCards />
			</Suspense>
		</section>
	);
}

async function DoctorCards() {
	const result = await getDoctorsToday().catch(() => null);
	const doctors = (result?.doctors ?? []).slice(0, SHOWN);

	if (doctors.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
				<p className="font-heading text-base font-semibold text-foreground">No open slots left today</p>
				<p className="mt-1 text-sm text-muted-foreground">Tomorrow&apos;s times are already open for booking.</p>
				<Button className="mt-4" render={<Link href={FIND_DOCTOR_PATH} />} nativeButton={false}>
					Find a time
				</Button>
			</div>
		);
	}

	return (
		<ul className="-mx-5 grid auto-cols-[78%] grid-flow-col gap-4 overflow-x-auto px-5 pb-1 sm:mx-0 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4 lg:gap-5">
			{doctors.map((doctor) => (
				<li key={doctor.id}>
					<TodayCard doctor={doctor} />
				</li>
			))}
		</ul>
	);
}

function TodayCard({ doctor }: { doctor: PublicDoctor }) {
	const profileHref = `${FIND_DOCTOR_PATH}/${doctor.id}`;

	return (
		<article className="flex h-full flex-col gap-3.5 rounded-xl border border-border bg-card p-5 shadow-card">
			<div className="flex items-center gap-3">
				<Avatar className="size-13">
					{doctor.photoUrl && <AvatarImage src={doctor.photoUrl} alt="" className="object-cover" />}
					<AvatarFallback className="bg-primary-soft font-heading text-lg font-bold text-primary">
						{getInitials(doctor.name)}
					</AvatarFallback>
				</Avatar>
				<div className="flex min-w-0 flex-col gap-0.5">
					<h3 className="truncate font-heading text-base font-bold text-foreground">{doctor.name}</h3>
					<span className="truncate text-[13px] text-muted-foreground">
						{doctor.specialties.map((specialty) => specialty.name).join(", ")}
					</span>
				</div>
			</div>
			<div className="flex items-center justify-between rounded-lg bg-background px-3 py-2.5 text-[13px]">
				<span className="flex items-center gap-1.5 text-foreground">
					<span aria-hidden="true" className="size-1.5 rounded-full bg-teal-600" />
					Next:{" "}
					<b className="font-semibold tabular-nums">
						{doctor.nextAvailableAt ? formatClinicTime(doctor.nextAvailableAt) : "—"}
					</b>
				</span>
				<span className="text-body">
					Fee <b className="font-semibold text-foreground tabular-nums">{formatCents(doctor.consultationFeeCents)}</b>
				</span>
			</div>
			<Button
				variant="secondary"
				className="mt-auto h-10 bg-primary-soft font-semibold text-primary hover:bg-primary-soft/70"
				render={<Link href={profileHref} aria-label={`Book ${doctor.name}`} />}
				nativeButton={false}
			>
				Book
			</Button>
		</article>
	);
}

function CardsSkeleton() {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
			{Array.from({ length: SHOWN }, (_, index) => (
				<Skeleton key={index} className="h-48 rounded-xl" />
			))}
		</div>
	);
}
