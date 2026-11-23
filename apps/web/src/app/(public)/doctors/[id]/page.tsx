import { DoctorAbout } from "@/components/modules/doctor-profile/DoctorAbout";
import { DoctorBooking } from "@/components/modules/doctor-profile/DoctorBooking";
import { DoctorHero } from "@/components/modules/doctor-profile/DoctorHero";
import { DoctorProfileSkeleton } from "@/components/modules/doctor-profile/DoctorProfileSkeleton";
import { OpenHours } from "@/components/modules/doctor-profile/OpenHours";
import { toBookingDays } from "@/lib/doctorProfile";
import { FIND_DOCTOR_PATH, getBookingWindow } from "@/lib/findDoctor";
import { DoctorService } from "@/services/doctor.service";
import { SlotService } from "@/services/slot.service";
import { doctorIdSchema } from "@/zod/doctor.validation";
import { isAxiosError } from "axios";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache, Suspense } from "react";

type Params = PageProps<"/doctors/[id]">["params"];

// cache(): metadata আর page দুজনেই ডাকে, কিন্তু api call একবার।
// ভুল id বা না-থাকা/বন্ধ doctor → null (404 page)
const getDoctor = cache(async (id: string) => {
	if (!doctorIdSchema.safeParse(id).success) return null;
	await connection(); // request-time data (prerender না)
	try {
		const response = await DoctorService.getPublicDoctorById(id);
		return response.data;
	} catch (error) {
		if (isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 400)) return null;
		throw error; // api down → error.tsx
	}
});

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const doctor = await getDoctor((await params).id);
	if (!doctor) return { title: "Doctor not found" };

	const specialties = doctor.specialties.map((specialty) => specialty.name).join(", ");
	return {
		title: doctor.name,
		description: `Book a visit with ${doctor.name}${specialties ? `, ${specialties}` : ""}, at ClinicOS General Hospital.`,
	};
}

export default function DoctorProfilePage({ params }: PageProps<"/doctors/[id]">) {
	return (
		// mobile-এ নিচের booking bar কনটেন্ট ঢেকে না দেয় → pb-32
		<div className="mx-auto w-full max-w-7xl px-4 pt-4 pb-32 md:px-8 md:pt-6 lg:pb-24">
			<Suspense fallback={<DoctorProfileSkeleton />}>
				<DoctorProfileContent params={params} />
			</Suspense>
		</div>
	);
}

async function DoctorProfileContent({ params }: { params: Params }) {
	const { id } = await params;
	const doctor = await getDoctor(id);
	if (!doctor) notFound();

	const { today } = getBookingWindow(new Date());
	const slotsResponse = await SlotService.getPublicSlots(doctor.id);
	const days = toBookingDays(slotsResponse.data.days, today);
	const primarySpecialty = doctor.specialties[0];

	return (
		<div className="flex flex-col gap-4 md:gap-5">
			<Link
				href={FIND_DOCTOR_PATH}
				className="flex w-fit items-center gap-1 text-sm font-medium text-body hover:text-foreground md:hidden"
			>
				<ChevronLeft className="size-4" aria-hidden="true" />
				Back to doctors
			</Link>

			<nav aria-label="Breadcrumb" className="hidden text-[13px] text-muted-foreground md:block">
				<ol className="flex flex-wrap items-center gap-1.5">
					<li>
						<Link href="/" className="hover:text-foreground">
							Home
						</Link>
					</li>
					<li aria-hidden="true">/</li>
					<li>
						<Link href={FIND_DOCTOR_PATH} className="hover:text-foreground">
							Find a doctor
						</Link>
					</li>
					{primarySpecialty && (
						<>
							<li aria-hidden="true">/</li>
							<li>
								<Link href={`${FIND_DOCTOR_PATH}?specialty=${primarySpecialty.slug}`} className="hover:text-foreground">
									{primarySpecialty.name}
								</Link>
							</li>
						</>
					)}
					<li aria-hidden="true">/</li>
					<li aria-current="page" className="text-body">
						{doctor.name}
					</li>
				</ol>
			</nav>

			<div className="grid items-start gap-4 md:gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-8">
				<div className="flex min-w-0 flex-col gap-4 md:gap-5">
					<DoctorHero doctor={doctor} today={today} />
					<DoctorAbout doctor={doctor} />
					<OpenHours days={days.slice(0, 7)} today={today} />
				</div>

				<DoctorBooking
					doctorName={doctor.name}
					feeCents={doctor.consultationFeeCents}
					roomNumber={doctor.roomNumber}
					nextAvailableAt={doctor.nextAvailableAt}
					days={days}
					today={today}
				/>
			</div>
		</div>
	);
}
