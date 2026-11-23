import { PaymentReturnBanner } from "@/components/modules/portal/PaymentReturnBanner";
import { PortalAppointmentTable } from "@/components/modules/portal/PortalAppointmentTable";
import { PortalAppointmentTabs } from "@/components/modules/portal/PortalAppointmentTabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTableSkeleton } from "@/components/shared/data-table/DataTableSkeleton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PORTAL_TAB_CONFIG, periodOptions, periodToRange } from "@/lib/portalAppointments";
import { AppointmentService } from "@/services/appointment.service";
import type { AppointmentPeriod } from "@/types/appointment.types";
import { type PortalAppointmentTab, portalAppointmentsQuerySchema } from "@/zod/appointment.validation";
import { isAxiosError } from "axios";
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
	// মাস শুধু বছরের সাথে; URL-এ বছর ছাড়া মাস থাকলে উপেক্ষা
	const month = query.year ? query.month : undefined;
	const range = periodToRange(query.year, month);
	const sortOrder = query.sortOrder ?? config.sortOrder;

	// patientId পাঠাই না: api session থেকে নেয় (IDOR-safe)। অন্য tab থেকে শুধু মোট সংখ্যা (limit 1)
	const [listResponse, otherResponse, periodsResponse] = await Promise.all([
		AppointmentService.getMyAppointments({
			status: config.statuses,
			searchTerm: query.searchTerm,
			...range,
			sortBy: "startAt",
			sortOrder,
			page: query.page,
			limit: query.limit,
		}),
		// একই search → tab-এর সংখ্যা = মিলে যাওয়া appointment
		AppointmentService.getMyAppointments({
			status: PORTAL_TAB_CONFIG[otherTab].statuses,
			searchTerm: query.searchTerm,
			...range,
			limit: 1,
		}),
		// Year/Month filter-এ শুধু যে বছর/মাসে এই tab-এর appointment আছে।
		// এটা না পেলে পুরো page ভাঙবে না → শুধু chip লুকাবে (filter ঐচ্ছিক সুবিধা)
		AppointmentService.getMyAppointmentPeriods(config.statuses).catch((error: unknown) => {
			// পুরো AxiosError log করি না: ওতে request-এর Cookie header (accessToken) থাকে
			const status = isAxiosError(error) ? error.response?.status : undefined;
			console.error(`Could not load appointment periods (status ${status ?? "network error"})`);
			return { data: [] as AppointmentPeriod[] };
		}),
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
			<PortalAppointmentTabs active={query.tab} counts={counts} query={{ ...query, month }} />
			<PortalAppointmentTable
				data={listResponse.data}
				meta={meta}
				query={{ ...query, month }}
				sortOrder={sortOrder}
				nowMs={nowMs}
				{...periodOptions(periodsResponse.data, query.year, month)}
			/>
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
