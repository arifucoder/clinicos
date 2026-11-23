"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import {
	formatClinicTime,
	formatDayLabel,
	fromCalendarDate as toDateString,
	toCalendarDate as toLocalDate,
} from "@/lib/clinicDate";
import type { BookableSlot } from "@/lib/deskBooking";
import { pluralize } from "@/lib/format";
import { CalendarDays, ChevronDown } from "lucide-react";
import { useState } from "react";

interface SlotPickerProps {
	openDates: string[]; // যেসব দিনে খালি slot আছে
	firstDate: string; // booking window-এর শুরু (আজ)
	lastDate: string; // booking window-এর শেষ
	date: string; // বাছাই করা দিন
	today: string;
	slots: BookableSlot[]; // বাছাই করা দিনের খালি slot
	slotId?: string;
}

export function SlotPicker({ openDates, firstDate, lastDate, date, today, slots, slotId }: SlotPickerProps) {
	const { setParams, isPending } = useTableUrlState();
	const [open, setOpen] = useState(false);
	const openSet = new Set(openDates);

	const handleSelect = (day: Date) => {
		setOpen(false);
		const next = toDateString(day);
		setParams({ date: next === today ? null : next, slotId: null });
	};

	return (
		<div className="space-y-4">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger
					render={<Button variant="outline" className="h-10 w-full justify-start sm:w-80" disabled={isPending} />}
				>
					<CalendarDays aria-hidden="true" />
					<span>{date === today ? "Today" : formatDayLabel(date)}</span>
					<span className="ml-auto text-xs font-normal text-muted-foreground">
						{pluralize(slots.length, "open slot")}
					</span>
					<ChevronDown className="text-muted-foreground" aria-hidden="true" />
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						required
						selected={toLocalDate(date)}
						defaultMonth={toLocalDate(date)}
						startMonth={toLocalDate(firstDate)}
						endMonth={toLocalDate(lastDate)}
						disabled={(day) => !openSet.has(toDateString(day))}
						onSelect={handleSelect}
					/>
				</PopoverContent>
			</Popover>

			<div role="group" aria-label="Time" className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
				{slots.map((slot) => (
					<Button
						key={slot.id}
						variant={slot.id === slotId ? "default" : "outline"}
						aria-pressed={slot.id === slotId}
						disabled={isPending}
						className="tabular-nums"
						onClick={() => setParams({ slotId: slot.id })}
					>
						{formatClinicTime(slot.startAt)}
						{slot.inProgress && <span className="text-[11px] font-semibold text-teal-600">Now</span>}
					</Button>
				))}
			</div>
		</div>
	);
}
