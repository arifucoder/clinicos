import { PaymentReturnBanner } from "@/components/modules/portal/PaymentReturnBanner";
import { PortalAppointmentTable } from "@/components/modules/portal/PortalAppointmentTable";
import { PortalAppointmentTabs } from "@/components/modules/portal/PortalAppointmentTabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTableSkeleton } from "@/components/shared/data-table/DataTableSkeleton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PORTAL_TAB_CONFIG } from "@/lib/portalAppointments";
import { AppointmentService } from "@/services/appointment.service";
import { type PortalAppointmentTab, portalAppointmentsQuerySchema } from "@/zod/appointment.validation";
import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata: Metadata = { title: "My appointments" };

type SearchParams = PageProps<"/portal/appointments">["searchParams"];

export default function PortalAppointmentsPage({ searchParams }: PageProps<"/portal/appointments">) {
	return (
		<div className="space-y-5">
			<PageHeader
				title="My appointments"
				actions={
					<Button render={<Link href="/doctors" />} nativeButton={false}>
						<Search aria-hidden="true" />
						Book an appointment
					</Button>
				}
			/>
			<Suspense fallback={<AppointmentsSkeleton />}>
				<AppointmentsContent searchParams={searchParams} />
			</Suspense>
		</div>
	);
}

async function AppointmentsContent({ searchParams }: { searchParams: SearchParams }) {
	// ভুল URL (?tab=xyz&page=-3) → crash না করে default
	const query = portalAppointmentsQuerySchema.parse(await searchParams);

	// request-time-এ চালাও → এর পরে new Date() নিরাপদ
	await connection();
	const nowMs = new Date().getTime();

	const otherTab = query.tab === "upcoming" ? "past" : "upcoming";
	const config = PORTAL_TAB_CONFIG[query.tab];

	// patientId পাঠাই না: api session থেকে নেয় (IDOR-safe)। অন্য tab থেকে শুধু মোট সংখ্যা (limit 1)
	const [listResponse, otherResponse] = await Promise.all([
		AppointmentService.getMyAppointments({
			status: config.statuses,
			sortBy: "startAt",
			sortOrder: config.sortOrder,
			page: query.page,
			limit: query.limit,
		}),
		AppointmentService.getMyAppointments({ status: PORTAL_TAB_CONFIG[otherTab].statuses, limit: 1 }),
	]);

	const meta = listResponse.meta ?? {
		page: query.page,
		limit: query.limit,
		total: listResponse.data.length,
		totalPages: 1,
	};
	const otherTotal = otherResponse.meta?.total ?? otherResponse.data.length;
	const counts: Record<PortalAppointmentTab, number> =
		query.tab === "upcoming" ? { upcoming: meta.total, past: otherTotal } : { upcoming: otherTotal, past: meta.total };

	const paidAppointment = query.appointment
		? listResponse.data.find((appointment) => appointment.id === query.appointment)
		: undefined;

	return (
		<div className="space-y-4">
			{query.payment && <PaymentReturnBanner payment={query.payment} appointment={paidAppointment} />}
			<PortalAppointmentTabs active={query.tab} counts={counts} />
			<PortalAppointmentTable data={listResponse.data} meta={meta} query={query} nowMs={nowMs} />
		</div>
	);
}

function AppointmentsSkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex gap-2 border-b border-border pb-2">
				<Skeleton className="h-7 w-28" />
				<Skeleton className="h-7 w-20" />
			</div>
			<DataTableSkeleton rows={5} columns={5} />
		</div>
	);
}
