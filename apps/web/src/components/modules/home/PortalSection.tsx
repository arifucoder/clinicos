import { Button } from "@/components/ui/button";
import { Bell, Check, CreditCard, FileText, ListChecks, Mail } from "lucide-react";
import Link from "next/link";
import { bigH2Class, sectionClass } from "./homeStyles";

const FEATURES = [
	{ icon: ListChecks, title: "Every visit, one list", text: "Upcoming and past appointments with their status." },
	{ icon: Mail, title: "Email at every step", text: "Booking confirmed, payment received, or a change from the clinic." },
	{ icon: FileText, title: "Prescriptions", text: "Read or print your prescription after the visit." },
];

// appointment-এর আসল state machine: PENDING_PAYMENT → CONFIRMED → CHECKED_IN → COMPLETED
const STEPS = [
	{ label: "Booked", time: "Mon 18:02", state: "done" },
	{ label: "Paid", time: "Mon 18:03", state: "done" },
	{ label: "Checked in", time: "10:18", state: "current" },
	{ label: "Completed", time: "~10:45", state: "next" },
] as const;

export function PortalSection() {
	return (
		<section aria-labelledby="portal-heading" className="relative overflow-hidden border-y border-border bg-background">
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1.3px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_80%_at_75%_50%,#000_20%,transparent_80%)]"
			/>
			<div className={`${sectionClass} relative grid items-center gap-12 py-18 md:py-26 lg:grid-cols-12 lg:gap-6`}>
				<div className="flex flex-col gap-4.5 lg:col-span-5 lg:pr-8">
					<span className="flex h-7 w-fit items-center gap-2 rounded-full border border-border bg-card pr-3 pl-2.5 text-[13px] font-medium text-foreground">
						<span aria-hidden="true" className="size-1.75 rounded-full bg-teal-600" />
						Patient portal
					</span>
					<h2 id="portal-heading" className={bigH2Class}>
						Your visits, in one place
					</h2>
					<p className="text-base leading-relaxed text-body md:text-[17px]">
						No more phone calls to ask what&apos;s booked. Everything about your visits is in your portal.
					</p>
					<ul className="flex flex-col gap-3.5">
						{FEATURES.map(({ icon: Icon, title, text }) => (
							<li key={title} className="flex gap-3">
								<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
									<Icon className="size-3.5" aria-hidden="true" />
								</span>
								<div className="flex flex-col gap-0.5">
									<b className="text-[15px] font-semibold text-foreground">{title}</b>
									<span className="text-sm text-body">{text}</span>
								</div>
							</li>
						))}
					</ul>
					<Button
						variant="outline"
						size="lg"
						className="mt-1 h-11 w-fit bg-card font-semibold"
						render={<Link href="/portal" />}
						nativeButton={false}
					>
						Open the patient portal
					</Button>
				</div>

				<div className="relative lg:col-span-7">
					<div
						role="img"
						aria-label="Illustration: an appointment that is booked, paid and checked in, waiting to be completed"
						className="overflow-hidden rounded-2xl border border-border bg-card shadow-overlay"
					>
						<div className="flex items-center gap-3.5 border-b border-border px-5 py-4.5 md:px-6">
							<span className="flex h-10 items-center rounded-[10px] bg-inverse px-3 font-heading text-base font-bold text-white tabular-nums">
								10:30
							</span>
							<div className="flex min-w-0 flex-1 flex-col">
								<b className="truncate text-[15px] font-semibold text-foreground">Dr. Nadia Rahman · Room 205</b>
								<span className="text-[13px] text-muted-foreground">General Medicine · Tue 24 Nov</span>
							</div>
							<span className="hidden h-6 items-center gap-1.5 rounded-full bg-teal-50 px-2.5 text-xs font-medium text-teal-700 sm:flex">
								<span className="size-1.5 rounded-full bg-teal-600" />
								Checked in
							</span>
						</div>

						<div className="px-5 pt-8 pb-7 md:px-6">
							<div className="relative grid grid-cols-4">
								<div className="absolute inset-x-[12.5%] top-3.75 h-0.75 rounded-full bg-border" />
								<div className="absolute top-3.75 left-[12.5%] h-0.75 w-1/2 rounded-full bg-primary" />
								{STEPS.map((step) => (
									<div key={step.label} className="relative flex flex-col items-center gap-2.5 text-center">
										<span
											className={
												step.state === "done"
													? "flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
													: step.state === "current"
														? "flex size-8 items-center justify-center rounded-full border-2 border-teal-600 bg-card shadow-[0_0_0_5px_var(--color-teal-50)]"
														: "size-8 rounded-full border-2 border-dashed border-slate-300 bg-card"
											}
										>
											{step.state === "done" && <Check className="size-4" />}
											{step.state === "current" && <span className="size-2.5 rounded-full bg-teal-600" />}
										</span>
										<b
											className={
												step.state === "current"
													? "text-[13px] font-semibold text-teal-700 md:text-sm"
													: step.state === "done"
														? "text-[13px] font-semibold text-foreground md:text-sm"
														: "text-[13px] font-medium text-muted-foreground md:text-sm"
											}
										>
											{step.label}
										</b>
										<span className="text-xs text-muted-foreground tabular-nums md:text-[13px]">{step.time}</span>
									</div>
								))}
							</div>
						</div>

						<div className="grid gap-3 px-5 pb-6 sm:grid-cols-2 md:px-6">
							<div className="flex items-center gap-3 rounded-[10px] border border-border p-3.5">
								<span className="flex size-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
									<FileText className="size-4.5" />
								</span>
								<div className="flex flex-1 flex-col">
									<b className="text-sm font-semibold text-foreground">Prescription</b>
									<span className="text-xs text-muted-foreground">After your visit</span>
								</div>
								<span className="text-xs font-medium text-muted-foreground">Pending</span>
							</div>
							<div className="flex items-center gap-3 rounded-[10px] border border-border p-3.5">
								<span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
									<CreditCard className="size-4.5" />
								</span>
								<div className="flex flex-1 flex-col">
									<b className="text-sm font-semibold text-foreground">Consultation fee</b>
									<span className="text-xs text-muted-foreground">Paid online</span>
								</div>
								<span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700">Paid</span>
							</div>
						</div>
					</div>

					<div className="absolute -top-7 left-0 hidden w-75 items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3 shadow-overlay md:flex lg:-left-8">
						<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
							<Bell className="size-4" aria-hidden="true" />
						</span>
						<div className="flex flex-col">
							<b className="text-[13px] font-semibold text-foreground">Payment received — you&apos;re confirmed</b>
							<span className="text-xs text-muted-foreground">Email · Mon 18:03</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
