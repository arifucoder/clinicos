"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import { formatDayLabel, fromCalendarDate, toCalendarDate } from "@/lib/clinicDate";
import { BOOKING_WINDOW_DAYS, type BookingWindow } from "@/lib/findDoctor";
import { cn } from "@/lib/utils";
import { CalendarDays, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface DoctorFiltersProps {
	date?: string;
	show: "open" | "all";
	bookingWindow: BookingWindow;
}

const sectionTitle = "mb-2.5 text-[13px] font-semibold text-foreground";

// "Filter" button + popover: তারিখ আর availability। specialty আলাদা dropdown-এ (toolbar-এ)
export function DoctorFilters({ date, show, bookingWindow }: DoctorFiltersProps) {
	const { today, tomorrow, lastDate } = bookingWindow;
	const { setParams, isPending } = useTableUrlState();
	const [calendarOpen, setCalendarOpen] = useState(false);

	// filter বদলালে page 1-এ ফিরি
	const update = (patch: { date?: string | null; show?: string | null }) => setParams(patch, { resetPage: true });

	const isPicked = Boolean(date && date !== today && date !== tomorrow);
	const activeCount = Number(Boolean(date)) + Number(show === "all");
	const toggleDate = (value: string) => update({ date: date === value ? null : value });

	const dateChip = (active: boolean) =>
		cn(
			"h-8.5 rounded-md text-[13px] font-medium shadow-none",
			active ? "bg-card font-semibold text-foreground shadow-card hover:bg-card" : "text-body hover:bg-card/60",
		);

	return (
		<Popover>
			<PopoverTrigger
				render={
					<Button
						variant="outline"
						className={cn("h-12 gap-2 bg-card px-4 text-[15px] font-medium", activeCount > 0 && "border-primary")}
						aria-label={activeCount > 0 ? `Filter, ${activeCount} active` : "Filter"}
					/>
				}
			>
				<SlidersHorizontal className="size-4.5" aria-hidden="true" />
				Filter
				{activeCount > 0 && (
					<span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground tabular-nums">
						{activeCount}
					</span>
				)}
			</PopoverTrigger>

			<PopoverContent align="end" className="w-[min(92vw,380px)] gap-0 p-0">
				<div aria-busy={isPending} className={cn("flex flex-col transition-opacity", isPending && "opacity-70")}>
					<div className="flex items-center justify-between px-5 pt-5 pb-3">
						<h2 className="font-heading text-base font-bold text-foreground">Filter options</h2>
						<Button
							variant="link"
							size="sm"
							className="h-7 px-1 font-semibold text-destructive"
							disabled={activeCount === 0}
							onClick={() => update({ date: null, show: null })}
						>
							Reset
						</Button>
					</div>

					<div className="border-t border-border px-5 py-4">
						<p className={sectionTitle}>Availability</p>
						<div role="radiogroup" aria-label="Availability" className="flex flex-col gap-1">
							{[
								{ value: "open", label: "Doctors with open slots", hint: "Ready to book now" },
								{ value: "all", label: "All doctors", hint: "Include doctors with no open times" },
							].map((option) => (
								<label
									key={option.value}
									className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md px-1 hover:bg-muted"
								>
									<input
										type="radio"
										name="show"
										className="size-4 accent-primary"
										checked={show === option.value}
										onChange={() => update({ show: option.value === "open" ? null : option.value })}
									/>
									<span className="flex flex-col">
										<span className="text-sm text-foreground">{option.label}</span>
										<span className="text-xs text-muted-foreground">{option.hint}</span>
									</span>
								</label>
							))}
						</div>
					</div>

					<div className="border-t border-border px-5 pt-4 pb-5">
						<p className={sectionTitle}>Date</p>
						<div className="grid grid-cols-3 gap-0.5 rounded-[10px] bg-muted p-0.75">
							<Button variant="ghost" aria-pressed={date === today} className={dateChip(date === today)} onClick={() => toggleDate(today)}>
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
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
