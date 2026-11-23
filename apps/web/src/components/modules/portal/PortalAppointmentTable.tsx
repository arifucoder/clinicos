"use client";

import { payMyAppointmentAction } from "@/actions/appointment.action";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { PORTAL_TAB_CONFIG } from "@/lib/portalAppointments";
import type { PaginationMeta } from "@/types/api.types";
import type { Appointment } from "@/types/appointment.types";
import { PORTAL_APPOINTMENT_PAGE_SIZES, type PortalAppointmentsQuery } from "@/zod/appointment.validation";
import { CalendarDays, History, Search, SearchX } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CancelMyAppointmentDialog } from "./CancelMyAppointmentDialog";
import { PORTAL_APPOINTMENT_MOBILE_COLUMNS, getPortalAppointmentColumns } from "./portalAppointmentColumns";

interface PortalAppointmentTableProps {
	data: Appointment[];
	meta: PaginationMeta;
	query: PortalAppointmentsQuery;
	nowMs: number;
}

export function PortalAppointmentTable({ data, meta, query, nowMs }: PortalAppointmentTableProps) {
	const config = PORTAL_TAB_CONFIG[query.tab];
	const [busyId, setBusyId] = useState<string | null>(null);
	const [, startTransition] = useTransition();

	// dialog-এর target আর open আলাদা: বন্ধের animation-এর সময় লেখা হঠাৎ মুছে যায় না
	const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
	const [cancelOpen, setCancelOpen] = useState(false);

	const columns = getPortalAppointmentColumns({
		busyId,
		nowMs,
		onCancel: (appointment) => {
			setCancelTarget(appointment);
			setCancelOpen(true);
		},
		onPay: (appointment) => {
			setBusyId(appointment.id);
			startTransition(async () => {
				const result = await payMyAppointmentAction(appointment.id);
				if (!result.success) {
					setBusyId(null);
					toast.error(result.message);
					return;
				}
				// Stripe-এর page-এ যাই; busy থাকুক যাতে দুবার click না হয়
				window.location.assign(result.data.checkoutUrl);
			});
		},
	});

	const emptyState =
		meta.total > 0 ? (
			<EmptyState icon={SearchX} title="Nothing on this page" description="Use the pagination below to go back." />
		) : (
			<EmptyState
				icon={query.tab === "upcoming" ? CalendarDays : History}
				title={config.emptyTitle}
				description={config.emptyDescription}
				action={
					query.tab === "upcoming" ? (
						<Button render={<Link href="/doctors" />} nativeButton={false}>
							<Search aria-hidden="true" />
							Find a doctor
						</Button>
					) : undefined
				}
			/>
		);

	return (
		<>
			<DataTable
				columns={columns}
				data={data}
				meta={meta}
				sort={{ sortBy: "startAt", sortOrder: config.sortOrder }}
				pageSizes={PORTAL_APPOINTMENT_PAGE_SIZES}
				mobileColumns={PORTAL_APPOINTMENT_MOBILE_COLUMNS}
				emptyState={emptyState}
			/>

			<CancelMyAppointmentDialog appointment={cancelTarget} open={cancelOpen} onOpenChange={setCancelOpen} />
		</>
	);
}
