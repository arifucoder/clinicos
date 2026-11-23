"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { formatClinicTime, formatDayLabel, formatNextAvailable } from "@/lib/clinicDate";
import {
	type BookingDay,
	bookSlotHref,
	clinicMinutes,
	firstOpenDate,
	nextOpenDateAfter,
	TIME_GROUPS,
} from "@/lib/doctorProfile";
import { CLINIC_TIME_ZONE, formatCents } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const WEEK = 7;

interface DoctorBookingProps {
	doctorId: string;
	doctorName: string;
	feeCents: number;
	roomNumber: string | null;
	nextAvailableAt: string | null;
	days: BookingDay[]; // পুরো booking window (১৪ দিন)
	today: string;
}

export function DoctorBooking(props: DoctorBookingProps) {
	const { days, today, nextAvailableAt } = props;
	const initialDate = firstOpenDate(days) ?? today;
	const [date, setDate] = useState(initialDate);
	const [slotId, setSlotId] = useState<string | null>(null);
	const [week, setWeek] = useState(days.findIndex((day) => day.date === initialDate) >= WEEK ? 1 : 0);
	const [sheetOpen, setSheetOpen] = useState(false);

	const selectedSlot = days.flatMap((day) => day.slots).find((slot) => slot.id === slotId);

	const picker = (
		<BookingPicker
			{...props}
			date={date}
			week={week}
			slotId={slotId}
			onWeekChange={setWeek}
			onDateChange={(next) => {
				setDate(next);
				setSlotId(null); // অন্য দিনের slot বাছাই করা থাকতে পারে না
				setWeek(days.findIndex((day) => day.date === next) >= WEEK ? 1 : 0);
			}}
			onSlotChange={setSlotId}
		/>
	);

	return (
		<>
			<aside
				aria-label="Book a visit"
				className="hidden rounded-xl border border-border bg-card shadow-raised lg:sticky lg:top-24 lg:block"
			>
				{picker}
			</aside>

			<div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)] backdrop-blur lg:hidden">
				<div className="mx-auto flex max-w-xl items-center gap-3">
					<div className="flex min-w-0 flex-1 flex-col">
						<span className="text-xs text-muted-foreground">{selectedSlot ? "Selected" : "Next available"}</span>
						<span className="truncate font-heading text-[15px] font-bold text-foreground tabular-nums">
							{selectedSlot
								? `${formatDayLabel(date)} · ${formatClinicTime(selectedSlot.startAt)}`
								: nextAvailableAt
									? formatNextAvailable(nextAvailableAt, today)
									: "No open slots soon"}
						</span>
					</div>
					{selectedSlot ? (
						<Button
							size="lg"
							className="h-11 px-5 font-semibold"
							render={<Link href={bookSlotHref(props.doctorId, selectedSlot.id)} />}
							nativeButton={false}
						>
							Continue
						</Button>
					) : (
						<Button size="lg" className="h-11 px-5 font-semibold" onClick={() => setSheetOpen(true)}>
							Choose a time
						</Button>
					)}
				</div>
			</div>

			<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
				<SheetContent side="bottom" className="max-h-[90svh] gap-0 overflow-y-auto rounded-t-2xl p-0 lg:hidden">
					<SheetTitle className="sr-only">Choose a time</SheetTitle>
					<SheetDescription className="sr-only">Pick a day and an open time with {props.doctorName}</SheetDescription>
					{picker}
				</SheetContent>
			</Sheet>
		</>
	);
}

interface BookingPickerProps extends DoctorBookingProps {
	date: string;
	week: number;
	slotId: string | null;
	onWeekChange: (week: number) => void;
	onDateChange: (date: string) => void;
	onSlotChange: (slotId: string) => void;
}

function BookingPicker({
	doctorId,
	doctorName,
	feeCents,
	roomNumber,
	days,
	today,
	date,
	week,
	slotId,
	onWeekChange,
	onDateChange,
	onSlotChange,
}: BookingPickerProps) {
	const weekDays = days.slice(week * WEEK, week * WEEK + WEEK);
	const hasNextWeek = days.length > WEEK;
	const selectedDay = days.find((day) => day.date === date);
	const slots = selectedDay?.slots ?? [];
	const selectedSlot = slots.find((slot) => slot.id === slotId);
	const nextOpen = nextOpenDateAfter(days, date);

	const groups = TIME_GROUPS.map((group) => ({
		...group,
		slots: slots.filter((slot) => group.matches(clinicMinutes(slot.startAt))),
	})).filter((group) => group.slots.length > 0);

	return (
		<div className="flex flex-col">
			<div className="flex items-baseline justify-between px-5 pt-5 pb-4">
				<h2 className="font-heading text-lg font-bold text-foreground">Book a visit</h2>
				<span className="text-sm text-body">
					<b className="font-semibold text-foreground tabular-nums">{formatCents(feeCents)}</b> / visit
				</span>
			</div>

			<div className="flex items-center justify-between px-5 pb-2">
				<span className="text-[13px] font-medium text-body">{week === 0 ? "This week" : "Next week"}</span>
				{hasNextWeek && (
					<div className="flex gap-1">
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label="Previous week"
							disabled={week === 0}
							onClick={() => onWeekChange(0)}
						>
							<ChevronLeft />
						</Button>
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label="Next week"
							disabled={week === 1}
							onClick={() => onWeekChange(1)}
						>
							<ChevronRight />
						</Button>
					</div>
				)}
			</div>

			<div role="group" aria-label="Choose a day" className="grid grid-cols-7 gap-1.5 px-5">
				{weekDays.map((day) => {
					const [weekday, dayNumber] = formatDayLabel(day.date).split(" ");
					const active = day.date === date;
					const empty = day.availableCount === 0;
					return (
						<button
							key={day.date}
							type="button"
							aria-pressed={active}
							aria-label={`${formatDayLabel(day.date)}, ${empty ? "no open slots" : `${day.availableCount} open slots`}`}
							onClick={() => onDateChange(day.date)}
							className={cn(
								"flex h-18 flex-col items-center justify-center gap-px rounded-[10px] border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
								active
									? "border-primary bg-primary text-primary-foreground"
									: empty
										? "border-dashed border-border bg-background text-muted-foreground"
										: "border-border bg-card text-foreground hover:border-primary/50",
							)}
						>
							<span className={cn("text-[11px] font-medium", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
								{day.date === today ? "Today" : weekday}
							</span>
							<span className="text-[17px] font-semibold tabular-nums">{dayNumber}</span>
							<span
								className={cn(
									"text-[10px] font-semibold tabular-nums",
									active ? "text-primary-foreground" : empty ? "text-muted-foreground" : "text-teal-700",
								)}
							>
								{empty ? "—" : day.availableCount}
							</span>
						</button>
					);
				})}
			</div>

			<div className="flex flex-col gap-3.5 px-5 pt-4 pb-1">
				{groups.length > 0 ? (
					groups.map((group) => (
						<div key={group.name} className="flex flex-col gap-2">
							<div className="flex items-baseline gap-2">
								<span className="text-[13px] font-semibold text-foreground">{group.name}</span>
								<span className="text-xs text-muted-foreground">{group.range}</span>
							</div>
							<div role="group" aria-label={`${group.name} times`} className="grid grid-cols-4 gap-1.5">
								{group.slots.map((slot) => {
									const blocked = slot.status === "BLOCKED";
									const active = slot.id === slotId;
									return (
										<button
											key={slot.id}
											type="button"
											aria-pressed={active}
											disabled={blocked}
											aria-label={blocked ? `${formatClinicTime(slot.startAt)}, unavailable` : undefined}
											onClick={() => onSlotChange(slot.id)}
											className={cn(
												"h-9 rounded-lg border text-[13px] tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
												active
													? "border-primary bg-primary font-semibold text-primary-foreground"
													: blocked
														? "cursor-not-allowed border-muted bg-background text-muted-foreground line-through"
														: "border-border bg-card font-medium text-foreground hover:border-primary/50",
											)}
										>
											{formatClinicTime(slot.startAt)}
										</button>
									);
								})}
							</div>
						</div>
					))
				) : (
					<div className="flex flex-col items-start gap-1 rounded-lg border border-dashed border-border px-3 py-2.5 text-[13px] text-body">
						No open times on {formatDayLabel(date)}.
						{nextOpen && (
							<button
								type="button"
								className="font-semibold text-primary hover:underline"
								onClick={() => onDateChange(nextOpen)}
							>
								{formatDayLabel(nextOpen)} has open slots →
							</button>
						)}
					</div>
				)}

				<span className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<Clock className="size-3.5" aria-hidden="true" />
					All times are clinic time ({CLINIC_TIME_ZONE}).
				</span>
			</div>

			{selectedSlot && (
				<div aria-live="polite" className="mx-5 mt-4 flex flex-col gap-1.5 rounded-[10px] border border-primary-soft bg-primary-soft/60 px-4 py-3.5">
					<span className="text-xs font-semibold tracking-wide text-primary uppercase">Your selection</span>
					<b className="font-heading text-[17px] font-bold text-foreground tabular-nums">
						{formatDayLabel(date)} · {formatClinicTime(selectedSlot.startAt)}
					</b>
					<span className="text-[13px] text-body">
						In person · {doctorName}
						{roomNumber && ` · Room ${roomNumber}`}
					</span>
					<span className="text-[13px] text-body">{formatCents(feeCents)} · pay online or at the clinic</span>
				</div>
			)}

			<div className="flex flex-col gap-2 px-5 pt-4 pb-5">
				{selectedSlot ? (
					<Button
						size="lg"
						className="h-12 text-[15px] font-semibold"
						render={<Link href={bookSlotHref(doctorId, selectedSlot.id)} />}
						nativeButton={false}
					>
						Continue
						<ArrowRight />
					</Button>
				) : (
					<Button size="lg" className="h-12 text-[15px] font-semibold" disabled>
						Pick a time to continue
					</Button>
				)}
				<span className="text-center text-xs text-muted-foreground">
					You&apos;ll log in or create a patient account next. You won&apos;t be charged yet.
				</span>
			</div>
		</div>
	);
}
