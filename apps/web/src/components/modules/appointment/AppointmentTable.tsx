"use client";

import { checkInAppointmentAction, sendPaymentLinkAction, undoCheckInAction } from "@/actions/appointment.action";
import { CollectFeeDialog } from "@/components/modules/front-desk/CollectFeeDialog";
import { UndoCheckInDialog } from "@/components/modules/front-desk/UndoCheckInDialog";
import { DoctorPicker } from "@/components/modules/slot/DoctorPicker";
import { DataTable } from "@/components/shared/data-table/DataTable";
import { DataTableSearch } from "@/components/shared/data-table/DataTableSearch";
import { FilterChip } from "@/components/shared/data-table/FilterChip";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import { APPOINTMENT_STATUS_META, SOURCE_LABEL } from "@/lib/appointmentDisplay";
import { formatClinicTime, formatDayLabel } from "@/lib/clinicDate";
import type { PaginationMeta } from "@/types/api.types";
import type { Appointment } from "@/types/appointment.types";
import type { SlotDoctorOption } from "@/types/slot.types";
import {
	APPOINTMENT_PAGE_SIZES,
	APPOINTMENT_SOURCES,
	APPOINTMENT_STATUSES,
	type AppointmentListQuery,
} from "@/zod/appointment.validation";
import { CalendarDays, CalendarPlus, SearchX, X } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { APPOINTMENT_MOBILE_COLUMNS, getAppointmentColumns } from "./appointmentColumns";
import { CancelAppointmentDialog } from "./CancelAppointmentDialog";
import { DayNav } from "./DayNav";
import { NoShowDialog } from "./NoShowDialog";

const STATUS_OPTIONS = APPOINTMENT_STATUSES.map((value) => ({ value, label: APPOINTMENT_STATUS_META[value].label }));
const SOURCE_OPTIONS = APPOINTMENT_SOURCES.map((value) => ({ value, label: SOURCE_LABEL[value] }));

interface AppointmentTableProps {
	data: Appointment[];
	meta: PaginationMeta;
	query: AppointmentListQuery;
	date: string;
	today: string;
	nowMs: number;
	doctors: SlotDoctorOption[];
}

function useDialogTarget() {
	const [target, setTarget] = useState<Appointment | null>(null);
	const [open, setOpen] = useState(false);
	const show = (appointment: Appointment) => {
		setTarget(appointment);
		setOpen(true);
	};
	return { target, open, setOpen, show };
}

export function AppointmentTable({ data, meta, query, date, today, nowMs, doctors }: AppointmentTableProps) {
	const { setParams } = useTableUrlState();
	const [busyId, setBusyId] = useState<string | null>(null);
	const [, startTransition] = useTransition();

	const feeDialog = useDialogTarget();
	const undoDialog = useDialogTarget();
	const cancelDialog = useDialogTarget();
	const noShowDialog = useDialogTarget();

	const quickUndo = (appointment: Appointment) => {
		setBusyId(appointment.id);
		startTransition(async () => {
			const result = await undoCheckInAction(appointment.id);
			setBusyId(null);
			if (result.success) toast.success(`Check-in undone for ${appointment.patient.fullName}`);
			else toast.error(result.message);
		});
	};

	const columns = getAppointmentColumns({
		busyId,
		nowMs,
		onCollectFee: feeDialog.show,
		onUndoCheckIn: undoDialog.show,
		onCancel: cancelDialog.show,
		onMarkNoShow: noShowDialog.show,
		onCheckIn: (appointment) => {
			setBusyId(appointment.id);
			startTransition(async () => {
				const result = await checkInAppointmentAction(appointment.id);
				setBusyId(null);
				if (!result.success) {
					toast.error(result.message);
					return;
				}
				toast.success(
					`${appointment.patient.fullName} checked in · ${appointment.doctor.user.name} · ${formatClinicTime(appointment.startAt)}`,
					{ action: { label: "Undo", onClick: () => quickUndo(appointment) }, duration: 8000 },
				);
			});
		},
		onSendPaymentLink: (appointment) => {
			setBusyId(appointment.id);
			startTransition(async () => {
				const result = await sendPaymentLinkAction(appointment.id);
				setBusyId(null);
				if (result.success) toast.success(`Payment link sent to ${appointment.patient.user.email}`);
				else toast.error(result.message);
			});
		},
	});

	const hasFilters = !!(query.searchTerm || query.doctorId || query.status || query.source);

	const emptyState =
		meta.total > 0 ? (
			<EmptyState icon={SearchX} title="Nothing on this page" description="Use the pagination below to go back." />
		) : hasFilters ? (
			<EmptyState
				icon={SearchX}
				title="No matching appointments"
				description="Try another name, phone or appointment no., or clear the filters."
			/>
		) : (
			<EmptyState
				icon={CalendarDays}
				title={`No appointments on ${formatDayLabel(date)}`}
				description="Pick another day, or book one for a patient."
				action={
					<Button render={<Link href="/admin/front-desk/book" />} nativeButton={false}>
						<CalendarPlus aria-hidden="true" />
						Book for patient
					</Button>
				}
			/>
		);

	return (
		<>
			<DataTable
				columns={columns}
				data={data}
				meta={meta}
				sort={{ sortBy: query.sortBy, sortOrder: query.sortOrder }}
				pageSizes={APPOINTMENT_PAGE_SIZES}
				mobileColumns={APPOINTMENT_MOBILE_COLUMNS}
				emptyState={emptyState}
				toolbar={
					<>
						<DayNav date={date} today={today} />
						<DataTableSearch placeholder="Search name, phone or appointment no." />
						<div className="flex items-center gap-1">
							<DoctorPicker doctors={doctors} value={query.doctorId} />
							{query.doctorId && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setParams({ doctorId: null }, { resetPage: true })}
									aria-label="Show all doctors"
								>
									<X aria-hidden="true" />
									All doctors
								</Button>
							)}
						</div>
						<FilterChip label="Status" paramKey="status" options={STATUS_OPTIONS} />
						<FilterChip label="Booked via" paramKey="source" options={SOURCE_OPTIONS} />
					</>
				}
			/>

			<CollectFeeDialog appointment={feeDialog.target} open={feeDialog.open} onOpenChange={feeDialog.setOpen} />
			<UndoCheckInDialog appointment={undoDialog.target} open={undoDialog.open} onOpenChange={undoDialog.setOpen} />
			<CancelAppointmentDialog
				appointment={cancelDialog.target}
				open={cancelDialog.open}
				onOpenChange={cancelDialog.setOpen}
			/>
			<NoShowDialog appointment={noShowDialog.target} open={noShowDialog.open} onOpenChange={noShowDialog.setOpen} />
		</>
	);
}
