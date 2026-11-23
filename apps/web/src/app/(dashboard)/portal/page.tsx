import { LastVisitCard } from "@/components/modules/portal/LastVisitCard";
import { NextAppointmentCard } from "@/components/modules/portal/NextAppointmentCard";
import { StatGrid, type StatItem } from "@/components/shared/StatGrid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { clinicToday } from "@/lib/clinicDate";
import { getCurrentUser } from "@/lib/currentUser";
import { formatCents } from "@/lib/format";
import { PatientService } from "@/services/patient.service";
import { StatsService } from "@/services/stats.service";
import { CalendarCheck, CalendarDays, CheckCircle2, CreditCard, Info, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Home" };

export default function PatientDashboardPortalPage() {
	return (
		<Suspense fallback={<HomeSkeleton />}>
			<HomeContent />
		</Suspense>
	);
}

async function HomeContent() {
	// সব call-এ কোনো id যায় না: api session থেকে রোগী বের করে (IDOR-safe)
	// getCurrentUser cache()-এ → layout-এর সাথে একই request-এ api-তে একবারই
	const [me, statsResponse, profileResponse] = await Promise.all([
		getCurrentUser(),
		StatsService.getPatientStats(),
		PatientService.getMyProfile(),
	]);
	const stats = statsResponse.data;
	const profile = profileResponse.data;

	// request-time-এ চালাও → এর পরে new Date() নিরাপদ
	await connection();
	const today = clinicToday(new Date());
	const firstName = (me?.name ?? profile.fullName).split(" ")[0];

	const items: StatItem[] = [
		{ label: "Upcoming", value: String(stats.upcomingCount), icon: CalendarDays, tone: "primary" },
		{ label: "Awaiting payment", value: String(stats.pendingPaymentCount), icon: CreditCard, tone: "warning" },
		{ label: "Completed visits", value: String(stats.completedCount), icon: CheckCircle2, tone: "success" },
		{ label: "Total paid", value: formatCents(stats.totalPaidCents), icon: CalendarCheck, tone: "primary" },
	];

	return (
		<div className="space-y-5">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="space-y-1">
					<h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-[28px]">
						Hi, {firstName}
					</h1>
					<p className="text-sm text-muted-foreground">Your appointments and visits at a glance.</p>
				</div>
				<Button render={<Link href="/doctors" />} nativeButton={false}>
					<Search aria-hidden="true" />
					Book an appointment
				</Button>
			</div>

			{!profile.profileComplete && (
				<div
					role="status"
					className="flex flex-wrap items-center gap-3 rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning-foreground"
				>
					<Info className="size-4 shrink-0" aria-hidden="true" />
					<p className="flex-1">Complete your profile before booking — we need your phone, date of birth and gender.</p>
					<Button size="sm" variant="outline" render={<Link href="/portal/profile" />} nativeButton={false}>
						Complete profile
					</Button>
				</div>
			)}

			<div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-start">
				<NextAppointmentCard appointment={stats.nextAppointment} today={today} />
				<LastVisitCard visit={stats.lastVisit} today={today} />
			</div>

			<StatGrid items={items} className="sm:grid-cols-4 xl:grid-cols-4" />
		</div>
	);
}

function HomeSkeleton() {
	return (
		<div className="space-y-5" aria-busy="true">
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-4 w-64" />
				</div>
				<Skeleton className="h-10 w-44" />
			</div>
			<div className="grid gap-5 lg:grid-cols-[1fr_360px]">
				<Skeleton className="h-60 rounded-xl" />
				<Skeleton className="h-60 rounded-xl" />
			</div>
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{Array.from({ length: 4 }, (_, i) => (
					<Skeleton key={i} className="h-24 rounded-xl" />
				))}
			</div>
		</div>
	);
}
