"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import { formatDayLabel, fromCalendarDate, toCalendarDate } from "@/lib/clinicDate";
import { BOOKING_WINDOW_DAYS, type BookingWindow } from "@/lib/findDoctor";
import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";
import { useState } from "react";

const VISIBLE_SPECIALTIES = 6;

export interface SpecialtyOption {
	name: string;
	slug: string;
	doctorCount?: number; // "All specialties"-এ নেই
}

interface DoctorFiltersProps {
	specialties: SpecialtyOption[];
	specialty?: string;
	date?: string;
	bookingWindow: BookingWindow;
}

// <legend> browser নিজে fieldset-এর border-এর উপর বসায়, তাই fieldset-এর padding-top ওর উপরে কাজ করে না।
// float-left + w-full দিলে legend সাধারণ block-এর মতো padding-এর ভেতরে আসে; পরের element-এ clear-both
const legendClass = "float-left mb-2.5 w-full p-0 text-[13px] font-semibold text-foreground";
const fieldsetClass = "m-0 border-0 border-b border-border/60 px-5 py-4.5 last:border-b-0 [&>legend+*]:clear-both";

export function DoctorFilters({ specialties, specialty, date, bookingWindow }: DoctorFiltersProps) {
	const { today, tomorrow, lastDate } = bookingWindow;
	const { setParams, isPending } = useTableUrlState();
	// বাছাই করা specialty লুকানো অংশে পড়লে শুরু থেকেই সব দেখাই
	const selectedIndex = specialties.findIndex((option) => option.slug === specialty);
	const [showAll, setShowAll] = useState(selectedIndex >= VISIBLE_SPECIALTIES);
	const [calendarOpen, setCalendarOpen] = useState(false);

	// filter বদলালে page 1-এ ফিরি
	const update = (patch: { specialty?: string | null; date?: string | null }) => setParams(patch, { resetPage: true });

	const visible = showAll ? specialties : specialties.slice(0, VISIBLE_SPECIALTIES);
	const hiddenCount = specialties.length - VISIBLE_SPECIALTIES;
	const isPicked = Boolean(date && date !== today && date !== tomorrow);

	// একই chip আবার চাপলে বাদ (any day)
	const toggleDate = (value: string) => update({ date: date === value ? null : value });

	const dateChip = (active: boolean) =>
		cn(
			"h-8.5 rounded-md text-[13px] font-medium shadow-none",
			active ? "bg-card font-semibold text-foreground shadow-card hover:bg-card" : "text-body hover:bg-card/60",
		);

	return (
		<div aria-busy={isPending} className={cn("flex flex-col transition-opacity", isPending && "opacity-70")}>
			<div className="flex items-center justify-between border-b border-border px-5 py-4">
				<h2 className="font-heading text-base font-bold text-foreground">Filters</h2>
				<Button
					variant="link"
					size="sm"
					className="h-7 px-1.5 font-semibold"
					disabled={!specialty && !date}
					onClick={() => update({ specialty: null, date: null })}
				>
					Reset
				</Button>
			</div>

			<fieldset className={fieldsetClass}>
				<legend className={legendClass}>Specialty</legend>
				<div className="flex flex-col gap-1">
					{[{ name: "All specialties", slug: "" } as SpecialtyOption, ...visible].map((option) => (
						<label
							key={option.slug || "all"}
							className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-md px-1 text-sm text-foreground hover:bg-muted"
						>
							<input
								type="radio"
								name="specialty"
								className="size-4 accent-primary"
								checked={(specialty ?? "") === option.slug}
								onChange={() => update({ specialty: option.slug || null })}
							/>
							{option.name}
							{option.doctorCount !== undefined && (
								<span className="ml-auto text-xs text-muted-foreground tabular-nums">
									{option.doctorCount}
									<span className="sr-only"> {option.doctorCount === 1 ? "doctor" : "doctors"}</span>
								</span>
							)}
						</label>
					))}
				</div>
				{hiddenCount > 0 && (
					<Button
						variant="link"
						size="sm"
						className="mt-1 h-7 px-1 font-semibold"
						aria-expanded={showAll}
						onClick={() => setShowAll((value) => !value)}
					>
						{showAll ? "Show less" : `Show ${hiddenCount} more`}
					</Button>
				)}
			</fieldset>

			<fieldset className={fieldsetClass}>
				<legend className={legendClass}>Date</legend>
				<div className="grid grid-cols-3 gap-0.5 rounded-[10px] bg-muted p-0.75">
					<Button
						variant="ghost"
						aria-pressed={date === today}
						className={dateChip(date === today)}
						onClick={() => toggleDate(today)}
					>
						Today
					</Button>
					<Button
						variant="ghost"
						aria-pressed={date === tomorrow}
						className={dateChip(date === tomorrow)}
						onClick={() => toggleDate(tomorrow)}
					>
						Tomorrow
					</Button>
					<Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
						<PopoverTrigger
							render={
								<Button
									variant="ghost"
									aria-pressed={isPicked}
									aria-label="Pick a date"
									className={cn(dateChip(isPicked), "gap-1.5")}
								/>
							}
						>
							<CalendarDays className="size-3.5" aria-hidden="true" />
							Pick
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="end">
							<Calendar
								mode="single"
								required
								selected={date ? toCalendarDate(date) : undefined}
								defaultMonth={toCalendarDate(date ?? today)}
								startMonth={toCalendarDate(today)}
								endMonth={toCalendarDate(lastDate)}
								// অতীত বা booking window-এর বাইরে → বন্ধ (api-ও এগুলো 400 দিত)
								disabled={(day) => {
									const value = fromCalendarDate(day);
									return value < today || value > lastDate;
								}}
								onSelect={(day) => {
									setCalendarOpen(false);
									update({ date: fromCalendarDate(day) });
								}}
							/>
						</PopoverContent>
					</Popover>
				</div>
				<p className="mt-2.5 text-xs text-muted-foreground">
					{date ? formatDayLabel(date) : `Any day in the next ${BOOKING_WINDOW_DAYS} days`} · clinic time
				</p>
			</fieldset>
		</div>
	);
}
