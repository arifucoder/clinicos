"use client";

import { Button } from "@/components/ui/button";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import { addDays, formatDayLabel } from "@/lib/clinicDate";
import { BOARD_DAYS } from "@/zod/slot.validation";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export function WeekNav({ from, today }: { from: string; today: string }) {
	const { setParams, isPending } = useTableUrlState();
	const to = addDays(from, BOARD_DAYS - 1);
	const go = (date: string) => setParams({ from: date === today ? null : date });

	return (
		<div className="flex items-center gap-1">
			<Button variant="outline" size="icon" aria-label="Previous 7 days" onClick={() => go(addDays(from, -BOARD_DAYS))}>
				<ChevronLeft aria-hidden="true" />
			</Button>
			<p
				className="flex min-w-44 items-center justify-center gap-2 text-sm font-medium tabular-nums"
				aria-live="polite"
			>
				{isPending && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />}
				{formatDayLabel(from)} – {formatDayLabel(to)}
			</p>
			<Button variant="outline" size="icon" aria-label="Next 7 days" onClick={() => go(addDays(from, BOARD_DAYS))}>
				<ChevronRight aria-hidden="true" />
			</Button>
			<Button variant="ghost" size="sm" disabled={from === today} onClick={() => go(today)}>
				Today
			</Button>
		</div>
	);
}
