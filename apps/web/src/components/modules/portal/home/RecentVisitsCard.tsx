import { pluralize } from "@/lib/format";
import { CLINIC_TIME_ZONE } from "@/lib/format";
import type { Appointment } from "@/types/appointment.types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: CLINIC_TIME_ZONE });

export function RecentVisitsCard({ visits }: { visits: Appointment[] }) {
	return (
		<section aria-labelledby="visits-heading" className="rounded-xl border border-border bg-card shadow-card">
			<div className="flex items-center justify-between border-b border-border px-5 py-3">
				<h2 id="visits-heading" className="font-heading text-base font-semibold text-foreground">
					Recent visits
				</h2>
				<Link
					href="/portal/appointments?tab=past"
					className="text-sm font-medium text-primary underline-offset-4 hover:underline"
				>
					All visits
				</Link>
			</div>

			{visits.length === 0 ? (
				<p className="px-5 py-8 text-center text-sm text-muted-foreground">
					Your visits and prescriptions will show up here.
				</p>
			) : (
				<ul className="divide-y divide-border">
					{visits.map((visit) => {
						const medicines = visit.prescription?.items.length ?? 0;
						const row = (
							<>
								<time
									dateTime={visit.startAt}
									className="w-14 shrink-0 text-sm text-muted-foreground tabular-nums"
								>
									{shortDate.format(new Date(visit.startAt))}
								</time>
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium text-foreground">
										{visit.prescription?.diagnosis ?? "No diagnosis recorded"}
									</p>
									<p className="truncate text-xs text-muted-foreground">{visit.doctor.user.name}</p>
								</div>
								{medicines > 0 && (
									<span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
										{pluralize(medicines, "medicine")}
									</span>
								)}
							</>
						);

						return (
							<li key={visit.id}>
								{visit.prescription ? (
									<Link
										href={`/portal/appointments/${visit.id}/print`}
										aria-label={`Prescription from ${visit.doctor.user.name}`}
										className="group flex items-center gap-3 px-5 py-3 outline-none hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
									>
										{row}
										<ChevronRight
											className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
											aria-hidden="true"
										/>
									</Link>
								) : (
									<div className="flex items-center gap-3 px-5 py-3">{row}</div>
								)}
							</li>
						);
					})}
				</ul>
			)}
		</section>
	);
}
