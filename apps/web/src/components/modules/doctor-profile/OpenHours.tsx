import { CLINIC_TIME_ZONE } from "@/lib/format";
import { formatDayLabel } from "@/lib/clinicDate";
import { type BookingDay, toOpenWindows } from "@/lib/doctorProfile";
import { cn } from "@/lib/utils";

const AXIS = ["00:00", "06:00", "12:00", "18:00", "24:00"];

export function OpenHours({ days, today }: { days: BookingDay[]; today: string }) {
	return (
		<section
			aria-labelledby="hours-heading"
			className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-card md:p-7"
		>
			<div className="flex flex-wrap items-baseline justify-between gap-2">
				<h2 id="hours-heading" className="font-heading text-lg font-bold text-foreground md:text-xl">
					Open times this week
				</h2>
				<span className="text-[13px] text-muted-foreground">Clinic time ({CLINIC_TIME_ZONE})</span>
			</div>

			<div
				aria-hidden="true"
				className="hidden justify-between text-[11px] font-medium text-muted-foreground sm:mr-2.5 sm:ml-89 sm:flex"
			>
				{AXIS.map((label) => (
					<span key={label}>{label}</span>
				))}
			</div>

			<ul className="flex flex-col">
				{days.map((day) => {
					const windows = toOpenWindows(day.slots);
					const isToday = day.date === today;
					return (
						<li
							key={day.date}
							className={cn(
								"grid grid-cols-[96px_minmax(0,1fr)] items-center gap-x-2 gap-y-2 border-t border-muted px-2.5 py-3 sm:grid-cols-[110px_220px_minmax(0,1fr)]",
								isToday && "rounded-md bg-background",
							)}
						>
							<span className="flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-foreground">
								{formatDayLabel(day.date).split(" ").slice(0, 2).join(" ")}
								{isToday && (
									<span className="rounded-full bg-primary-soft px-1.5 text-[10px] font-semibold text-primary">
										Today
									</span>
								)}
							</span>
							<span
								className={cn(
									"text-sm tabular-nums",
									windows.length ? "font-medium text-foreground" : "text-muted-foreground",
								)}
							>
								{windows.length ? windows.map((window) => window.label).join(", ") : "No open slots"}
							</span>
							<div
								aria-hidden="true"
								className="relative col-span-2 h-3.5 overflow-hidden rounded-full bg-muted sm:col-span-1"
							>
								{windows.map((window) => (
									<span
										key={window.label}
										className="absolute inset-y-0 rounded-full bg-primary"
										style={{ left: `${window.left}%`, width: `${Math.max(window.width, 1)}%` }}
									/>
								))}
							</div>
						</li>
					);
				})}
			</ul>

			<div className="flex flex-wrap gap-5 text-xs text-body">
				<span className="flex items-center gap-1.5">
					<span aria-hidden="true" className="h-2 w-4.5 rounded-full bg-primary" />
					Open slots
				</span>
				<span className="flex items-center gap-1.5">
					<span aria-hidden="true" className="h-2 w-4.5 rounded-full border border-border bg-muted" />
					Booked, closed or off
				</span>
			</div>
		</section>
	);
}
