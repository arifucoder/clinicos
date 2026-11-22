import { formatCents } from "@/lib/format";
import type { AdminStats } from "@/types/stats.types";

export function PeriodSummary({ totals, days }: { totals: AdminStats["totals"]; days: number }) {
	const bookings = totals.onlineBookings + totals.frontDeskBookings;
	const onlinePercent = bookings === 0 ? 0 : Math.round((totals.onlineBookings / bookings) * 100);
	const deskPercent = bookings === 0 ? 0 : 100 - onlinePercent;

	return (
		<section aria-labelledby="period-heading" className="rounded-xl border border-border bg-card p-5 shadow-card">
			<h2 id="period-heading" className="font-heading text-base font-semibold text-foreground">
				Last {days} days
			</h2>

			<dl className="mt-4 grid grid-cols-2 gap-4">
				<div>
					<dt className="text-xs font-medium text-muted-foreground">Collected</dt>
					<dd className="mt-1 font-heading text-xl font-bold tabular-nums">{formatCents(totals.collectedCents)}</dd>
				</div>
				<div>
					<dt className="text-xs font-medium text-muted-foreground">New patients</dt>
					<dd className="mt-1 font-heading text-xl font-bold tabular-nums">{totals.newPatients}</dd>
				</div>
			</dl>

			<div className="mt-6">
				<h3 className="text-xs font-medium text-muted-foreground">Booking source</h3>
				{bookings === 0 ? (
					<p className="mt-2 text-sm text-muted-foreground">No bookings in this period.</p>
				) : (
					<>
						<div
							className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-muted"
							role="img"
							aria-label={`${onlinePercent}% online, ${deskPercent}% front desk`}
						>
							<div className="bg-primary" style={{ width: `${onlinePercent}%` }} />
							<div className="bg-success" style={{ width: `${deskPercent}%` }} />
						</div>
						<ul className="mt-3 space-y-1.5 text-sm">
							<li className="flex items-center justify-between">
								<span className="flex items-center gap-2">
									<span className="size-2.5 rounded-full bg-primary" aria-hidden="true" />
									Online
								</span>
								<span className="tabular-nums text-body">
									{totals.onlineBookings} · {onlinePercent}%
								</span>
							</li>
							<li className="flex items-center justify-between">
								<span className="flex items-center gap-2">
									<span className="size-2.5 rounded-full bg-success" aria-hidden="true" />
									Front desk
								</span>
								<span className="tabular-nums text-body">
									{totals.frontDeskBookings} · {deskPercent}%
								</span>
							</li>
						</ul>
					</>
				)}
			</div>
		</section>
	);
}
