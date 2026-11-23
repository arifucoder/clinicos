import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { addDays, formatDayLabel } from "@/lib/clinicDate";
import { type BookingWindow, buildDoctorsHref, FIND_DOCTOR_PATH } from "@/lib/findDoctor";
import type { PublicDoctorListQuery } from "@/zod/doctor.validation";
import { CalendarX, SearchX } from "lucide-react";
import Link from "next/link";

interface NoDoctorsProps {
	query: PublicDoctorListQuery;
	bookingWindow: BookingWindow;
	total: number; // > 0 হলে filter ঠিক আছে, শুধু page নম্বর বেশি (?page=99)
}

export function NoDoctors({ query, bookingWindow, total }: NoDoctorsProps) {
	if (total > 0) {
		return (
			<Shell>
				<EmptyState
					icon={SearchX}
					title="This page is empty"
					description="The list is shorter than this page number."
					action={
						<Button render={<Link href={buildDoctorsHref(query, { page: 1 })} />} nativeButton={false}>
							Go to the first page
						</Button>
					}
				/>
			</Shell>
		);
	}

	const nextDay = query.date ? addDays(query.date, 1) : undefined;
	const canTryNextDay = nextDay !== undefined && nextDay <= bookingWindow.lastDate;

	return (
		<Shell>
			<EmptyState
				icon={query.date ? CalendarX : SearchX}
				title={
					query.date ? `No doctors free on ${formatDayLabel(query.date)}` : "No doctors match your search"
				}
				description={
					query.date
						? "Every slot that day is taken or closed. Try the next day, or any day."
						: "Try a different name or specialty, or clear the filters."
				}
				action={
					<div className="flex flex-wrap justify-center gap-2">
						{canTryNextDay && (
							<Button render={<Link href={buildDoctorsHref(query, { date: nextDay, page: 1 })} />} nativeButton={false}>
								Try {formatDayLabel(nextDay)}
							</Button>
						)}
						<Button variant="outline" render={<Link href={FIND_DOCTOR_PATH} />} nativeButton={false}>
							Clear all filters
						</Button>
					</div>
				}
			/>
		</Shell>
	);
}

function Shell({ children }: { children: React.ReactNode }) {
	return (
		<div role="status" className="rounded-xl border border-border bg-card shadow-card">
			{children}
		</div>
	);
}
