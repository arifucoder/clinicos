import { EmptyState } from "@/components/shared/EmptyState";
import { pluralize } from "@/lib/format";
import type { DailyStat } from "@/types/stats.types";
import { BarChart3 } from "lucide-react";
import { DailyChart } from "./DailyChart";

export function DailyActivityCard({ daily, days }: { daily: DailyStat[]; days: number }) {
	const totalAppointments = daily.reduce((sum, day) => sum + day.total, 0);
	const isEmpty = daily.every((day) => day.total === 0 && day.collectedCents === 0);

	return (
		<section aria-labelledby="daily-heading" className="rounded-xl border border-border bg-card p-5 shadow-card">
			<div className="mb-4 flex items-baseline justify-between gap-2">
				<h2 id="daily-heading" className="font-heading text-base font-semibold text-foreground">
					Appointments & collections
				</h2>
				<p className="text-sm text-muted-foreground tabular-nums">
					{pluralize(totalAppointments, "appointment")} · last {days} days
				</p>
			</div>

			{isEmpty ? (
				<EmptyState icon={BarChart3} title="No activity yet" description={`Nothing booked in the last ${days} days.`} />
			) : (
				<figure>
					<DailyChart daily={daily} />
					<figcaption className="sr-only">
						Daily appointments, completed appointments and fees collected over the last {days} days.
					</figcaption>
				</figure>
			)}
		</section>
	);
}
