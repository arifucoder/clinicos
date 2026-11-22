"use client";

import { unblockSlotsAction } from "@/actions/slot.action";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusPill } from "@/components/shared/StatusPill";
import { Button } from "@/components/ui/button";
import { formatClinicTime, formatDayLabel } from "@/lib/clinicDate";
import type { ManageSlot, ManageSlotDay } from "@/types/slot.types";
import { cn } from "cn";
import { Ban, CalendarX2, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { BlockSlotsDialog } from "./BlockSlotsDialog";
import { DeleteSlotsDialog } from "./DeleteSlotsDialog";

type ChipTone = "open" | "booked" | "pending" | "blocked";

// design: blue = open, teal = booked, amber = টাকার অপেক্ষা, rose = blocked
const CHIP_TONE: Record<ChipTone, string> = {
	open: "border-primary/20 bg-primary-soft text-primary-hover hover:border-primary/60",
	booked: "border-transparent bg-success-soft text-success-foreground hover:border-success/60",
	pending: "border-transparent bg-warning-soft text-warning-foreground hover:border-warning/60",
	blocked: "border-transparent bg-danger-soft text-danger-foreground hover:border-danger/60",
};

const TONE_LABEL: Record<ChipTone, string> = {
	open: "Open",
	booked: "Booked",
	pending: "Awaiting payment",
	blocked: "Blocked",
};

const LEGEND = [
	["open", "info"],
	["booked", "success"],
	["pending", "warning"],
	["blocked", "danger"],
] as const;

const toneOf = (slot: ManageSlot): ChipTone => {
	if (slot.state === "BLOCKED") return "blocked";
	if (slot.state === "OPEN") return "open";
	return slot.booking?.status === "PENDING_PAYMENT" ? "pending" : "booked";
};

const isPast = (slot: ManageSlot, nowMs: number) => new Date(slot.startAt).getTime() <= nowMs;

interface SlotBoardProps {
	doctorId: string;
	days: ManageSlotDay[];
	today: string;
	now: string; // server-এর সময় (ISO) — render-এ Date.now() না ডেকে prop থেকে
}

export function SlotBoard({ doctorId, days, today, now }: SlotBoardProps) {
	const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set());
	const [dialog, setDialog] = useState<"block" | "delete" | null>(null);
	const [isPending, startTransition] = useTransition();

	const nowMs = new Date(now).getTime();
	const slotsById = useMemo(() => new Map(days.flatMap((day) => day.slots).map((slot) => [slot.id, slot])), [days]);

	// revalidate-এর পরে যে slot আর নেই বা অতীত হয়ে গেছে, সেটা selection থেকে বাদ
	const selected = [...selectedIds]
		.map((id) => slotsById.get(id))
		.filter((slot): slot is ManageSlot => slot !== undefined && !isPast(slot, nowMs));

	const blockIds = selected.filter((slot) => slot.state !== "BLOCKED").map((slot) => slot.id); // OPEN + BOOKED
	const bookedCount = selected.filter((slot) => slot.state === "BOOKED").length;
	const unblockIds = selected.filter((slot) => slot.state === "BLOCKED").map((slot) => slot.id);
	const deleteIds = selected.filter((slot) => slot.state !== "BOOKED").map((slot) => slot.id);

	const toggle = (id: string) =>
		setSelectedIds((previous) => {
			const next = new Set(previous);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	const clearSelection = () => setSelectedIds(new Set());

	const handleUnblock = () => {
		startTransition(async () => {
			const result = await unblockSlotsAction(doctorId, unblockIds);
			if (!result.success) {
				toast.error(result.message);
				return;
			}
			toast.success(result.message);
			clearSelection();
		});
	};

	if (slotsById.size === 0) {
		return (
			<div className="rounded-xl border border-border bg-card">
				<EmptyState
					icon={CalendarX2}
					title="No slots in these 7 days"
					description="Use “Open slots” to add this doctor's hours, or check another week."
				/>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-2">
				{LEGEND.map(([tone, pill]) => (
					<StatusPill key={tone} tone={pill}>
						{TONE_LABEL[tone]}
					</StatusPill>
				))}
				<span className="text-xs text-muted-foreground">Select slots to block, unblock or delete.</span>
			</div>

			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
				{days.map((day) => {
					const isToday = day.date === today;
					return (
						<section
							key={day.date}
							aria-labelledby={`day-${day.date}`}
							className={cn("rounded-xl border bg-card p-3", isToday ? "border-primary/40" : "border-border")}
						>
							<header className="mb-2 flex items-center justify-between gap-2">
								<h2 id={`day-${day.date}`} className="text-sm font-semibold text-foreground">
									{formatDayLabel(day.date)}
								</h2>
								{isToday && <span className="text-xs font-medium text-primary">Today</span>}
							</header>

							{day.slots.length === 0 ? (
								<p className="text-xs text-muted-foreground">No slots</p>
							) : (
								<ul className="grid grid-cols-2 gap-1.5 xl:grid-cols-1">
									{day.slots.map((slot) => (
										<li key={slot.id}>
											<SlotChip
												slot={slot}
												past={isPast(slot, nowMs)}
												selected={selectedIds.has(slot.id)}
												onToggle={() => toggle(slot.id)}
											/>
										</li>
									))}
								</ul>
							)}
						</section>
					);
				})}
			</div>

			{selected.length > 0 && (
				<div
					role="region"
					aria-label="Selected slots"
					className="sticky bottom-4 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-lg"
				>
					<p className="mr-auto text-sm font-medium" aria-live="polite">
						{selected.length} selected
					</p>
					<Button
						size="sm"
						variant="outline"
						disabled={blockIds.length === 0 || isPending}
						onClick={() => setDialog("block")}
					>
						<Ban aria-hidden="true" /> Block ({blockIds.length})
					</Button>
					<Button size="sm" variant="outline" disabled={unblockIds.length === 0 || isPending} onClick={handleUnblock}>
						{isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <RotateCcw aria-hidden="true" />}
						Unblock ({unblockIds.length})
					</Button>
					<Button
						size="sm"
						variant="outline"
						className="text-destructive hover:text-destructive"
						disabled={deleteIds.length === 0 || isPending}
						onClick={() => setDialog("delete")}
					>
						<Trash2 aria-hidden="true" /> Delete ({deleteIds.length})
					</Button>
					<Button size="sm" variant="ghost" onClick={clearSelection}>
						Clear
					</Button>
				</div>
			)}

			<BlockSlotsDialog
				open={dialog === "block"}
				onOpenChange={(open) => setDialog(open ? "block" : null)}
				doctorId={doctorId}
				slotIds={blockIds}
				bookedCount={bookedCount}
				onDone={clearSelection}
			/>
			<DeleteSlotsDialog
				open={dialog === "delete"}
				onOpenChange={(open) => setDialog(open ? "delete" : null)}
				doctorId={doctorId}
				slotIds={deleteIds}
				onDone={clearSelection}
			/>
		</div>
	);
}

interface SlotChipProps {
	slot: ManageSlot;
	past: boolean;
	selected: boolean;
	onToggle: () => void;
}

function SlotChip({ slot, past, selected, onToggle }: SlotChipProps) {
	const tone = toneOf(slot);
	const time = `${formatClinicTime(slot.startAt)}–${formatClinicTime(slot.endAt)}`;
	const detail = slot.booking
		? `${slot.booking.patient.fullName} · ${slot.booking.appointmentNumber}`
		: slot.blockReason;
	// screen reader: "09:00–09:15, Booked, Rahim · APT-0012, past"
	const label = [time, TONE_LABEL[tone], detail, past ? "past" : null].filter(Boolean).join(", ");

	return (
		<button
			type="button"
			disabled={past}
			aria-pressed={past ? undefined : selected}
			aria-label={label}
			title={detail ?? undefined}
			onClick={onToggle}
			className={cn(
				"flex w-full flex-col items-start rounded-md border px-2 py-1.5 text-left text-xs transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
				CHIP_TONE[tone],
				selected && "ring-2 ring-primary ring-offset-1 ring-offset-card",
			)}
		>
			<span className="font-medium tabular-nums">{time}</span>
			{detail && <span className="w-full truncate text-[11px] opacity-90">{detail}</span>}
		</button>
	);
}
