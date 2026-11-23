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
	const query = portalAppointmentsQuerySchema.parse(await searchParams);

	await connection();
	const nowMs = new Date().getTime();

	const otherTab = query.tab === "upcoming" ? "past" : "upcoming";
	const config = PORTAL_TAB_CONFIG[query.tab];
	const month = query.year ? query.month : undefined;
	const range = periodToRange(query.year, month);
	const sortOrder = query.sortOrder ?? config.sortOrder;

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
		AppointmentService.getMyAppointments({
			status: PORTAL_TAB_CONFIG[otherTab].statuses,
			searchTerm: query.searchTerm,
			...range,
			limit: 1,
		}),
		AppointmentService.getMyAppointmentPeriods(config.statuses).catch((error: unknown) => {
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
