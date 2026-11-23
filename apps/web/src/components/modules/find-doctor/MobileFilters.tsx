"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { DoctorFilters } from "./DoctorFilters";

type MobileFiltersProps = ComponentProps<typeof DoctorFilters> & { resultCount: number };

// lg-এর নিচে sidebar থাকে না → একই DoctorFilters একটা bottom sheet-এ
export function MobileFilters({ resultCount, ...filterProps }: MobileFiltersProps) {
	const [open, setOpen] = useState(false);
	const activeCount = Number(Boolean(filterProps.specialty)) + Number(Boolean(filterProps.date));

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger render={<Button variant="outline" className="h-10 w-full bg-card font-semibold" />}>
				<SlidersHorizontal aria-hidden="true" />
				Filters
				{activeCount > 0 && (
					<span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground tabular-nums">
						{activeCount}
						<span className="sr-only"> active</span>
					</span>
				)}
			</SheetTrigger>

			<SheetContent side="bottom" className="max-h-[85svh] gap-0 overflow-y-auto rounded-t-2xl p-0">
				<SheetTitle className="sr-only">Filters</SheetTitle>
				<SheetDescription className="sr-only">Narrow the doctor list by specialty and date</SheetDescription>
				<DoctorFilters {...filterProps} />
				{/* filter সাথে সাথে বসে যায়; এই button শুধু sheet বন্ধ করে */}
				<SheetFooter className="sticky bottom-0 border-t border-border bg-popover p-4">
					<Button size="lg" className="h-11 w-full" onClick={() => setOpen(false)}>
						Show {resultCount} {resultCount === 1 ? "doctor" : "doctors"}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
