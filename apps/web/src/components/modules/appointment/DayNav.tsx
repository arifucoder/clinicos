"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import { addDays } from "@/lib/clinicDate";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DayNav({ date, today }: { date: string; today: string }) {
	const { setParams, isPending } = useTableUrlState();
	// আজ হলে URL থেকে date মুছি (default = আজ)
	const go = (next: string) => setParams({ date: next === today ? null : next }, { resetPage: true });

	return (
		<div className="flex items-center gap-1">
			<Button
				variant="outline"
				size="icon"
				aria-label="Previous day"
				disabled={isPending}
				onClick={() => go(addDays(date, -1))}
			>
				<ChevronLeft aria-hidden="true" />
			</Button>
			<Input
				type="date"
				aria-label="Appointment date"
				value={date}
				disabled={isPending}
				onChange={(event) => {
					if (event.target.value) go(event.target.value);
				}}
				className="h-9 w-40 tabular-nums"
			/>
			<Button
				variant="outline"
				size="icon"
				aria-label="Next day"
				disabled={isPending}
				onClick={() => go(addDays(date, 1))}
			>
				<ChevronRight aria-hidden="true" />
			</Button>
			<Button variant="ghost" size="sm" disabled={date === today || isPending} onClick={() => go(today)}>
				Today
			</Button>
		</div>
	);
}
