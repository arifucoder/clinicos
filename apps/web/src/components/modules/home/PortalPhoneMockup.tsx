import { CalendarDays, CircleCheck } from "lucide-react";

// সাজানো ছবি (illustration) — আসল data না। Portal-এর আসল জিনিস দেখায়: পরের visit, status, payment
export function PortalPhoneMockup() {
	return (
		<div
			role="img"
			aria-label="Illustration: the patient portal on a phone, showing a confirmed visit that is paid online"
			className="h-154 w-75 rounded-[46px] bg-inverse p-2.5 shadow-[0_30px_60px_rgb(15_23_42/0.18),0_8px_20px_rgb(15_23_42/0.1)]"
		>
			<div className="flex h-full flex-col overflow-hidden rounded-[36px] bg-background">
				<div className="mx-auto mt-2.5 h-6 w-23 rounded-full bg-inverse" />
				<div className="flex items-center justify-between px-4.5 pt-4.5">
					<div className="flex flex-col">
						<span className="text-[11px] text-muted-foreground">Good morning</span>
						<span className="font-heading text-base font-bold text-foreground">Your next visit</span>
					</div>
					<span className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
						FK
					</span>
				</div>

				<div className="relative mx-3.5 mt-4 overflow-hidden rounded-[18px] bg-inverse p-4.5 text-white">
					<div className="absolute -top-12 -right-12 size-45 rounded-full bg-[radial-gradient(closest-side,rgb(37_99_235/0.6),transparent)]" />
					<div className="relative flex items-center justify-between">
						<span className="text-[11px] font-semibold tracking-wider text-slate-300 uppercase">Tue 24 Nov</span>
						<span className="flex h-5 items-center gap-1.5 rounded-full bg-teal-500/20 px-2 text-[11px] font-medium text-teal-300">
							<CircleCheck className="size-3" />
							Confirmed
						</span>
					</div>
					<div className="relative mt-2.5 font-heading text-6xl leading-none font-bold tracking-tight">10:30</div>
					<div className="relative mt-2 text-[13px] text-slate-300">
						<b className="font-semibold text-white">Arrive by 10:20</b> · check in at reception
					</div>
				</div>

				<div className="mx-3.5 mt-3 rounded-[14px] border border-border bg-card px-3.5 py-1">
					{[
						["Doctor", "Dr. Nadia Rahman"],
						["Room", "205"],
						["Payment", "Paid online"],
					].map(([label, value], index) => (
						<div
							key={label}
							className={`flex justify-between py-2.5 text-xs ${index < 2 ? "border-b border-muted" : ""}`}
						>
							<span className="text-muted-foreground">{label}</span>
							<b className="font-semibold text-foreground">{value}</b>
						</div>
					))}
				</div>

				<div className="mx-3.5 mt-auto mb-4.5 flex h-11 items-center justify-center gap-2 rounded-[10px] bg-primary text-[13px] font-semibold text-primary-foreground">
					<CalendarDays className="size-4" />
					My visits
				</div>
			</div>
		</div>
	);
}
