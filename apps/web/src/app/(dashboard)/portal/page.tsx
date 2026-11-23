import { NextAppointmentCard } from "@/components/modules/portal/NextAppointmentCard";
import { FollowUpCard } from "@/components/modules/portal/home/FollowUpCard";
import { LatestPrescriptionCard } from "@/components/modules/portal/home/LatestPrescriptionCard";
import { ProfileProgressBanner } from "@/components/modules/portal/home/ProfileProgressBanner";
import { RecentVisitsCard } from "@/components/modules/portal/home/RecentVisitsCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { clinicToday } from "@/lib/clinicDate";
import { getCurrentUser } from "@/lib/currentUser";
import { formatLongClinicDate, greetingFor, profileCompleteness } from "@/lib/portalHome";
import { AppointmentService } from "@/services/appointment.service";
import { PatientService } from "@/services/patient.service";
import { StatsService } from "@/services/stats.service";
import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Home" };

const RECENT_VISITS = 3;

export default function PatientDashboardPortalPage() {
	return (
		<Suspense fallback={<HomeSkeleton />}>
			<HomeContent />
		</Suspense>
	);
}

async function HomeContent() {
	const [me, statsResponse, profileResponse, visitsResponse] = await Promise.all([
		getCurrentUser(),
		StatsService.getPatientStats(),
		PatientService.getMyProfile(),
		AppointmentService.getMyAppointments({
			status: ["COMPLETED"],
			sortBy: "startAt",
			sortOrder: "desc",
			limit: RECENT_VISITS,
		}),
	]);
	const stats = statsResponse.data;
	const profile = profileResponse.data;
	const visits = visitsResponse.data;

	const nextAppointment = stats.nextAppointment
		? (await AppointmentService.getMyAppointment(stats.nextAppointment.id)).data
		: null;

	await connection();
	const now = new Date();
	const nowMs = now.getTime();
	const today = clinicToday(now);
	const firstName = (me?.name ?? profile.fullName).split(" ")[0];
	const completeness = profileCompleteness(profile);

	const latestWithPrescription = visits.find((visit) => visit.prescription !== null);
	const followUpDate = latestWithPrescription?.prescription?.followUpDate ?? null;
	const followUpDue = followUpDate !== null && followUpDate.slice(0, 10) >= today;
	const followUpBooked =
		nextAppointment !== null && nextAppointment.doctor.id === latestWithPrescription?.doctor.id;

	return (
		<div className="space-y-5">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="space-y-1">
					<h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-[28px]">
						{greetingFor(now)}, {firstName}
					</h1>
					<p className="text-sm text-muted-foreground">{formatLongClinicDate(now)}</p>
				</div>
				<Button render={<Link href="/doctors" />} nativeButton={false}>
					<Search aria-hidden="true" />
					Book a doctor
				</Button>
			</div>

			{completeness.missingRequired.length > 0 && (
				<ProfileProgressBanner percent={completeness.percent} missingRequired={completeness.missingRequired} />
			)}

			<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
				<div className="space-y-5">
					<NextAppointmentCard appointment={nextAppointment} today={today} nowMs={nowMs} />
					<RecentVisitsCard visits={visits} />
				</div>

				<div className="space-y-5">
					{latestWithPrescription && <LatestPrescriptionCard visit={latestWithPrescription} />}
					{followUpDue && latestWithPrescription && (
						<FollowUpCard
							followUpDate={followUpDate}
							doctorName={latestWithPrescription.doctor.user.name}
							booked={followUpBooked}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

function HomeSkeleton() {
	return (
		<div className="space-y-5" aria-busy="true">
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-4 w-40" />
				</div>
				<Skeleton className="h-10 w-36" />
			</div>
			<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
				<div className="space-y-5">
					<Skeleton className="h-56 rounded-xl" />
					<Skeleton className="h-52 rounded-xl" />
				</div>
				<div className="space-y-5">
					<Skeleton className="h-44 rounded-xl" />
					<Skeleton className="h-40 rounded-xl" />
				</div>
			</div>
		</div>
	);
}
