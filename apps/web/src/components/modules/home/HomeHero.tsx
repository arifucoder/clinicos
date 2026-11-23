import { Skeleton } from "@/components/ui/skeleton";
import { addDays, formatClinicTime, formatDayLabel } from "@/lib/clinicDate";
import { BOOKING_WINDOW_DAYS, FIND_DOCTOR_PATH } from "@/lib/findDoctor";
import { getDoctorsToday, getHomeSpecialties } from "@/lib/homeData";
import { pluralize } from "@/lib/format";
import { getInitials } from "@/lib/userDisplay";
import { CalendarDays, ChevronDown, CircleCheck, Clock, CreditCard, FileText, Search } from "lucide-react";
import Form from "next/form";
import { Suspense } from "react";
import { PortalPhoneMockup } from "./PortalPhoneMockup";

export function HomeHero() {
	return (
		<section className="relative overflow-hidden border-b border-border bg-background">
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1.3px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_90%_80%_at_60%_40%,#000_30%,transparent_85%)]"
			/>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute top-10 right-0 size-180 rounded-full bg-[radial-gradient(closest-side,rgb(37_99_235/0.2),rgb(37_99_235/0.06)_55%,transparent)] lg:right-30"
			/>

			<div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-5 pt-10 pb-14 md:px-8 lg:grid-cols-12 lg:gap-6 lg:pt-18 lg:pb-22">
				<div className="flex flex-col gap-5 lg:col-span-7 lg:gap-5.5 lg:pr-6">
					<Suspense fallback={<Skeleton className="h-8 w-56 rounded-full" />}>
						<AvailabilityBadge />
					</Suspense>

					<h1 className="font-heading text-[40px] leading-[1.05] font-bold tracking-[-0.035em] text-foreground sm:text-5xl lg:text-6xl">
						See the right doctor,
						<br />
						<span className="text-primary">without the wait</span>
					</h1>
					<p className="max-w-140 text-base leading-relaxed text-body md:text-lg">
						Book online in minutes, pay online or at the clinic, and find every visit and prescription in your patient
						portal.
					</p>

					<Suspense fallback={<Skeleton className="h-36 w-full rounded-xl sm:h-19" />}>
						<HeroSearch />
					</Suspense>

					<ul aria-label="Why patients choose us" className="flex flex-wrap gap-x-6 gap-y-2.5 text-sm text-body">
						<li className="flex items-center gap-2">
							<Clock className="size-4 text-primary" aria-hidden="true" />
							Open 24/7
						</li>
						<li className="flex items-center gap-2">
							<CircleCheck className="size-4 text-primary" aria-hidden="true" />
							2-minute booking
						</li>
						<li className="flex items-center gap-2">
							<CreditCard className="size-4 text-primary" aria-hidden="true" />
							Pay online or at the clinic
						</li>
					</ul>
				</div>

				<div className="relative hidden h-160 items-center justify-center sm:flex lg:col-span-5">
					<PortalPhoneMockup />
					<Suspense fallback={null}>
						<NextAvailableCard />
					</Suspense>
					<div className="absolute right-0 bottom-24 flex w-60 items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-overlay lg:-right-4">
						<span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-teal-50 text-teal-700">
							<FileText className="size-5" aria-hidden="true" />
						</span>
						<div className="flex flex-col gap-0.5">
							<b className="text-sm font-semibold text-foreground">Prescription ready</b>
							<span className="text-[13px] text-body">View or print in your portal</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

async function AvailabilityBadge() {
	const { total } = await getDoctorsToday().catch(() => ({ total: 0 }));

	return (
		<span className="flex h-8 w-fit items-center gap-2 rounded-full border border-border bg-card pr-3.5 pl-3 text-[13px] font-medium text-foreground shadow-card">
			<span aria-hidden="true" className="size-2 rounded-full bg-teal-600 motion-safe:animate-live-pulse" />
			{total > 0 ? `${pluralize(total, "doctor")} available today` : "Open 24/7 · walk-ins welcome"}
		</span>
	);
}

async function HeroSearch() {
	const specialties = await getHomeSpecialties().catch(() => []);
	const { today } = await getDoctorsToday().catch(() => ({ today: undefined }));
	const days = today ? Array.from({ length: Math.min(7, BOOKING_WINDOW_DAYS) }, (_, index) => addDays(today, index)) : [];

	const selectClass =
		"h-7 w-full cursor-pointer appearance-none border-0 bg-transparent pr-6 text-[15px] font-semibold text-foreground outline-none";

	return (
		<Form
			action={FIND_DOCTOR_PATH}
			role="search"
			aria-label="Find available doctors"
			className="mt-1.5 grid gap-2 rounded-xl border border-border bg-card p-2.5 shadow-raised sm:grid-cols-[1.3fr_1fr_auto]"
		>
			<div className="relative flex flex-col gap-0.5 rounded-lg px-3 py-1.5 focus-within:bg-muted/60">
				<label htmlFor="home-specialty" className="text-xs font-medium text-muted-foreground">
					Specialty
				</label>
				<div className="relative flex items-center">
					<select id="home-specialty" name="specialty" defaultValue="" className={selectClass}>
						<option value="">Any specialty</option>
						{specialties.map((specialty) => (
							<option key={specialty.slug} value={specialty.slug}>
								{specialty.name}
							</option>
						))}
					</select>
					<ChevronDown className="pointer-events-none absolute right-0 size-4 text-muted-foreground" aria-hidden="true" />
				</div>
			</div>

			<div className="relative flex flex-col gap-0.5 rounded-lg border-border px-3 py-1.5 focus-within:bg-muted/60 sm:border-l sm:rounded-l-none">
				<label htmlFor="home-date" className="text-xs font-medium text-muted-foreground">
					Date
				</label>
				<div className="relative flex items-center gap-2">
					<CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
					<select id="home-date" name="date" defaultValue="" className={selectClass}>
						<option value="">Any day</option>
						{days.map((date, index) => (
							<option key={date} value={date}>
								{index === 0 ? "Today" : index === 1 ? "Tomorrow" : formatDayLabel(date)}
							</option>
						))}
					</select>
					<ChevronDown className="pointer-events-none absolute right-0 size-4 text-muted-foreground" aria-hidden="true" />
				</div>
			</div>

			<button
				type="submit"
				className="flex h-14 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-[15px] font-semibold whitespace-nowrap text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
			>
				<Search className="size-4.5" aria-hidden="true" />
				Find available doctors
			</button>
		</Form>
	);
}

async function NextAvailableCard() {
	const { doctors } = await getDoctorsToday().catch(() => ({ doctors: [] }));
	const first = doctors
		.filter((doctor) => doctor.nextAvailableAt)
		.toSorted((a, b) => (a.nextAvailableAt ?? "").localeCompare(b.nextAvailableAt ?? ""))[0];
	if (!first?.nextAvailableAt) return null;

	return (
		<div className="absolute top-23 left-0 flex w-60 items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-overlay lg:-left-6">
			<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft font-heading text-[13px] font-bold text-primary">
				{getInitials(first.name)}
			</span>
			<div className="flex min-w-0 flex-col gap-0.5">
				<span className="flex items-center gap-1.5 text-[11px] font-medium text-teal-700">
					<span aria-hidden="true" className="size-1.5 rounded-full bg-teal-600 motion-safe:animate-live-pulse" />
					Next available
				</span>
				<b className="truncate text-sm font-semibold text-foreground">{first.name}</b>
				<span className="text-xs text-muted-foreground tabular-nums">Today · {formatClinicTime(first.nextAvailableAt)}</span>
			</div>
		</div>
	);
}
