"use client";

import { checkInAppointmentAction, undoCheckInAction } from "@/actions/appointment.action";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusPill } from "@/components/shared/StatusPill";
import { Button } from "@/components/ui/button";
import { paidLabel } from "@/lib/appointmentDisplay";
import { formatClinicTime } from "@/lib/clinicDate";
import { formatCents } from "@/lib/format";
import type { Appointment } from "@/types/appointment.types";
import { cn } from "cn";
import { Banknote, CalendarCheck, CalendarPlus, Loader2, SearchX, Stethoscope, Undo2, UserCheck } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CollectFeeDialog } from "./CollectFeeDialog";
import { UndoCheckInDialog } from "./UndoCheckInDialog";

interface CheckInListProps {
	appointments: Appointment[];
	searchTerm?: string;
	/** doctor বা "All" filter চালু আছে কিনা (empty state-এর লেখা বদলায়) */
	hasFilters: boolean;
}

export function CheckInList({ appointments, searchTerm, hasFilters }: CheckInListProps) {
	const [busyId, setBusyId] = useState<string | null>(null);
	const [feeTarget, setFeeTarget] = useState<Appointment | null>(null);
	const [feeOpen, setFeeOpen] = useState(false);
	const [undoTarget, setUndoTarget] = useState<Appointment | null>(null);
	const [undoOpen, setUndoOpen] = useState(false);
	const [, startTransition] = useTransition();

	// toast-এর "Undo": সাথে সাথে ভুল ধরলে confirm ছাড়াই ফেরত
	const quickUndo = (appointment: Appointment) => {
		setBusyId(appointment.id);
		startTransition(async () => {
			const result = await undoCheckInAction(appointment.id);
			setBusyId(null);
			if (result.success) toast.success(`Check-in undone for ${appointment.patient.fullName}`);
			else toast.error(result.message);
		});
	};

	const handleCheckIn = (appointment: Appointment) => {
		setBusyId(appointment.id);
		startTransition(async () => {
			const result = await checkInAppointmentAction(appointment.id);
			setBusyId(null);
			if (!result.success) {
				toast.error(result.message);
				return;
			}
			// SDLC: "Checked in · Dr. X · 10:30" + ভুল click-এর জন্য Undo
			toast.success(
				`${appointment.patient.fullName} checked in · ${appointment.doctor.user.name} · ${formatClinicTime(appointment.startAt)}`,
				{ action: { label: "Undo", onClick: () => quickUndo(appointment) }, duration: 8000 },
			);
		});
	};

	if (appointments.length === 0) {
		return (
			<div className="rounded-xl border border-border bg-card shadow-card">
				{searchTerm ? (
					<EmptyState
						icon={SearchX}
						title={`No appointment today for “${searchTerm}”`}
						description="Check the name or phone number. No booking? Book for them first, then check in."
						action={
							<Button render={<Link href="/admin/front-desk/book" />} nativeButton={false}>
								<CalendarPlus aria-hidden="true" />
								Book for patient
							</Button>
						}
					/>
				) : hasFilters ? (
					<EmptyState
						icon={CalendarCheck}
						title="No one waiting here"
						description="Everyone for this filter has arrived. Choose another doctor or show all."
					/>
				) : (
					<EmptyState
						icon={CalendarCheck}
						title="No one left to check in"
						description="Every confirmed patient for today has arrived."
					/>
				)}
			</div>
		);
	}

	return (
		<>
			<ul className="space-y-3" aria-label="Today's appointments">
				{appointments.map((appointment) => (
					<li key={appointment.id}>
						<CheckInCard
							appointment={appointment}
							busy={busyId === appointment.id}
							onCheckIn={() => handleCheckIn(appointment)}
							onCollectFee={() => {
								setFeeTarget(appointment);
								setFeeOpen(true);
							}}
							onUndo={() => {
								setUndoTarget(appointment);
								setUndoOpen(true);
							}}
						/>
					</li>
				))}
			</ul>

			<CollectFeeDialog appointment={feeTarget} open={feeOpen} onOpenChange={setFeeOpen} />
			<UndoCheckInDialog appointment={undoTarget} open={undoOpen} onOpenChange={setUndoOpen} />
		</>
	);
}

interface CheckInCardProps {
	appointment: Appointment;
	busy: boolean;
	onCheckIn: () => void;
	onCollectFee: () => void;
	onUndo: () => void;
}

function CheckInCard({ appointment, busy, onCheckIn, onCollectFee, onUndo }: CheckInCardProps) {
	const { patient, doctor } = appointment;
	const isCheckedIn = appointment.status === "CHECKED_IN";
	// doctor prescription শুরু করলে undo চলবে না (api 409 দেয়; button-ও লুকাই)
	const canUndo = isCheckedIn && appointment.prescription === null;
	const paid = paidLabel(appointment);

	return (
		<article
			className={cn(
				"flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center",
				isCheckedIn && "bg-muted/40",
			)}
		>
			{/* সময় = রোগীর serial (slot-ই queue) */}
			<div className="flex shrink-0 items-baseline gap-2 sm:w-28 sm:flex-col sm:gap-0.5">
				<time dateTime={appointment.startAt} className="font-heading text-xl font-bold text-foreground tabular-nums">
					{formatClinicTime(appointment.startAt)}
				</time>
				<span className="font-mono text-xs text-muted-foreground">{appointment.appointmentNumber}</span>
			</div>

			<div className="min-w-0 flex-1 space-y-1.5">
				<div className="flex flex-wrap items-center gap-2">
					<h3 className="font-medium text-foreground">{patient.fullName}</h3>
					{patient.allergies && (
						<span title={patient.allergies}>
							<StatusPill tone="danger">Allergy</StatusPill>
						</span>
					)}
				</div>
				<p className="truncate text-sm text-muted-foreground">
					{[patient.phone, patient.user.email].filter(Boolean).join(" · ")}
				</p>
				<div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-body">
					<span className="inline-flex items-center gap-1">
						<Stethoscope className="size-3.5 text-muted-foreground" aria-hidden="true" />
						{doctor.user.name}
						{doctor.roomNumber && ` · Room ${doctor.roomNumber}`}
					</span>
					<span className="tabular-nums">{formatCents(appointment.feeCents)}</span>
					{paid ? <StatusPill tone="success">{paid}</StatusPill> : <StatusPill tone="warning">Fee unpaid</StatusPill>}
				</div>
			</div>

			<div className="flex shrink-0 items-center gap-2 sm:justify-end">
				{isCheckedIn ? (
					<>
						<StatusPill tone="info">
							Checked in{appointment.checkedInAt && ` · ${formatClinicTime(appointment.checkedInAt)}`}
						</StatusPill>
						{canUndo ? (
							<Button
								variant="ghost"
								size="sm"
								onClick={onUndo}
								disabled={busy}
								aria-label={`Undo check-in for ${patient.fullName}`}
							>
								{busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Undo2 aria-hidden="true" />}
								Undo
							</Button>
						) : (
							<span className="text-xs text-muted-foreground">With doctor</span>
						)}
					</>
				) : appointment.isPaid ? (
					<Button
						onClick={onCheckIn}
						disabled={busy}
						aria-label={`Check in ${patient.fullName}`}
						className="h-10 w-full min-w-32 sm:w-auto"
					>
						{busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <UserCheck aria-hidden="true" />}
						Check in
					</Button>
				) : (
					<Button
						variant="outline"
						onClick={onCollectFee}
						disabled={busy}
						aria-label={`Collect fee from ${patient.fullName}`}
						className="h-10 w-full min-w-32 sm:w-auto"
					>
						<Banknote aria-hidden="true" />
						Collect fee
					</Button>
				)}
			</div>
		</article>
	);
}
