import { DataTableSearch } from "@/components/shared/data-table/DataTableSearch";
import { DoctorCard } from "@/components/modules/find-doctor/DoctorCard";
import { DoctorFilters } from "@/components/modules/find-doctor/DoctorFilters";
import { DoctorPagination } from "@/components/modules/find-doctor/DoctorPagination";
import { DoctorSortSelect } from "@/components/modules/find-doctor/DoctorSortSelect";
import { FindDoctorSkeleton } from "@/components/modules/find-doctor/FindDoctorSkeleton";
import { NoDoctors } from "@/components/modules/find-doctor/NoDoctors";
import { SpecialtySelect } from "@/components/modules/find-doctor/SpecialtySelect";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDayLabel } from "@/lib/clinicDate";
import { clampToWindow, DOCTOR_GRID_PAGE_SIZE, getBookingWindow } from "@/lib/findDoctor";
import { DoctorService } from "@/services/doctor.service";
import { SpecialtyService } from "@/services/specialty.service";
import { publicDoctorListQuerySchema } from "@/zod/doctor.validation";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: "Find a doctor",
	description: "Browse ClinicOS doctors by specialty and date, and see each doctor's next open slot.",
};

type SearchParams = PageProps<"/doctors">["searchParams"];

export default function FindDoctorPage({ searchParams }: PageProps<"/doctors">) {
	return (
		<>
			<section className="relative overflow-hidden border-b border-border bg-card">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(#CBD5E1_1px,transparent_1.3px)] [background-size:22px_22px] [mask-image:linear-gradient(to_left,#000,transparent_60%)] md:block"
				/>
				<div className="relative mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-6 md:px-8 md:pt-8 md:pb-7">
					<div className="flex flex-col gap-2">
						<nav aria-label="Breadcrumb" className="text-[13px] text-muted-foreground">
							<Link href="/" className="rounded-sm hover:text-foreground">
								Home
							</Link>{" "}
							<span aria-hidden="true">/</span>{" "}
							<span aria-current="page" className="text-body">
								Find a doctor
							</span>
						</nav>
						<h1 className="font-heading text-[28px] font-bold tracking-tight text-foreground md:text-4xl">
							Find a doctor
						</h1>
						<p className="text-base text-body">Pick a doctor and see their next open slot.</p>
					</div>

					<Suspense fallback={<Skeleton className="h-12 w-full max-w-4xl" />}>
						<Toolbar searchParams={searchParams} />
					</Suspense>
				</div>
			</section>

			<div className="mx-auto w-full max-w-7xl px-5 pt-6 pb-16 md:px-8 md:pt-8 md:pb-20">
				<Suspense fallback={<FindDoctorSkeleton />}>
					<FindDoctorContent searchParams={searchParams} />
				</Suspense>
			</div>
		</>
	);
}

async function Toolbar({ searchParams }: { searchParams: SearchParams }) {
	const parsed = publicDoctorListQuerySchema.parse(await searchParams);
	await connection(); // নিচের new Date() request-time-এ
	const bookingWindow = getBookingWindow(new Date());
	const date = clampToWindow(parsed.date, bookingWindow);
	const specialties = await SpecialtyService.getPublicSpecialties()
		.then((response) => response.data.map(({ name, slug, doctorCount }) => ({ name, slug, doctorCount })))
		.catch(() => []);

	return (
		<div className="grid w-full max-w-4xl grid-cols-2 gap-3 sm:flex sm:items-center">
			<DataTableSearch
				placeholder="Search doctor name or specialty"
				className="col-span-2 sm:w-full sm:flex-1"
				inputClassName="h-12 rounded-[10px] text-[15px] shadow-card"
			/>
			<DoctorFilters date={date} show={parsed.show} bookingWindow={bookingWindow} />
			<SpecialtySelect specialties={specialties} specialty={parsed.specialty} />
		</div>
	);
}

async function FindDoctorContent({ searchParams }: { searchParams: SearchParams }) {
	const parsed = publicDoctorListQuerySchema.parse(await searchParams);
	await connection();
	const bookingWindow = getBookingWindow(new Date());
	const query = { ...parsed, date: clampToWindow(parsed.date, bookingWindow) };

	const [doctorsResponse, specialtiesResponse] = await Promise.all([
		DoctorService.getPublicDoctors(query, DOCTOR_GRID_PAGE_SIZE),
		SpecialtyService.getPublicSpecialties().catch(() => null),
	]);

	const doctors = doctorsResponse.data;
	const meta = doctorsResponse.meta ?? {
		page: query.page,
		limit: DOCTOR_GRID_PAGE_SIZE,
		total: doctors.length,
		totalPages: 1,
	};
	const specialtyName = specialtiesResponse?.data.find((option) => option.slug === query.specialty)?.name;

	const pillLabel = specialtyName ? `${specialtyName} specialists` : "Doctors";
	const scope = [
		query.date ? `free on ${formatDayLabel(query.date)}` : query.show === "open" ? "with open slots" : "all doctors",
		query.searchTerm && `matching “${query.searchTerm}”`,
	]
		.filter(Boolean)
		.join(" · ");

	return (
		<div className="flex flex-col gap-5">
			<div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
				<h2
					id="results-heading"
					className="flex w-fit items-center gap-2 rounded-lg border border-primary-soft bg-primary-soft/60 px-3.5 py-2 font-heading text-base font-bold text-foreground"
				>
					<span className="text-primary tabular-nums">{meta.total}</span>
					{pillLabel}
				</h2>
				<p aria-live="polite" className="text-sm font-medium text-body">
					{scope.charAt(0).toUpperCase() + scope.slice(1)}
				</p>
				<DoctorSortSelect sort={query.sort} />
			</div>

			{doctors.length > 0 ? (
				<ul aria-labelledby="results-heading" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
					{doctors.map((doctor) => (
						<li key={doctor.id}>
							<DoctorCard doctor={doctor} today={bookingWindow.today} />
						</li>
					))}
				</ul>
			) : (
				<NoDoctors query={query} bookingWindow={bookingWindow} total={meta.total} />
			)}

			<DoctorPagination meta={meta} query={query} />
		</div>
	);
}
