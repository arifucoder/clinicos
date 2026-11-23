import { CLINIC_INFO } from "@/lib/clinicInfo";
import { CircleCheck, DoorOpen, Mail, MonitorSmartphone, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { bigH2Class, eyebrowClass, sectionClass } from "./homeStyles";

export function ThreeWays() {
	return (
		<section id="how-it-works" aria-labelledby="ways-heading" className="scroll-mt-20 border-t border-border">
			<div className={`${sectionClass} flex flex-col gap-10 py-18 md:py-24`}>
				<div className="flex max-w-160 flex-col gap-2">
					<p className={eyebrowClass}>Booking</p>
					<h2 id="ways-heading" className={bigH2Class}>
						Three ways to see a doctor
					</h2>
					<p className="text-base leading-relaxed text-body md:text-[17px]">
						However you reach us, you get the same appointment, the same confirmation email and the same place in your
						portal.
					</p>
				</div>

				<div className="grid gap-5 md:grid-cols-3 md:gap-6">
					<WayCard
						icon={<MonitorSmartphone className="size-6" aria-hidden="true" />}
						title="Book online"
						text="Pick a doctor and a time slot, then pay now or at the clinic."
					>
						<div className="flex gap-1.5">
							{["10:00", "10:30", "11:00"].map((time, index) => (
								<span
									key={time}
									className={
										index === 1
											? "flex h-7.5 items-center rounded-md bg-primary px-2.5 text-xs font-semibold text-primary-foreground"
											: "flex h-7.5 items-center rounded-md border border-border bg-card px-2.5 text-xs font-medium text-foreground"
									}
								>
									{time}
								</span>
							))}
							<span className="flex h-7.5 items-center rounded-md border border-muted bg-background px-2.5 text-xs text-muted-foreground line-through">
								11:30
							</span>
						</div>
						<div className="grid grid-cols-2 rounded-lg bg-muted p-0.75 text-xs font-medium">
							<span className="flex h-7 items-center justify-center rounded-md bg-card text-foreground shadow-card">
								Pay now
							</span>
							<span className="flex h-7 items-center justify-center text-body">Pay at clinic</span>
						</div>
					</WayCard>

					<WayCard
						icon={<Phone className="size-6" aria-hidden="true" />}
						title="Call the front desk"
						text={`Call ${CLINIC_INFO.phone}. We book for you and email the details.`}
					>
						<div className="flex items-center gap-2.5">
							<span className="flex size-7 items-center justify-center rounded-lg border border-border bg-card text-body">
								<Mail className="size-3.5" />
							</span>
							<div className="flex min-w-0 flex-1 flex-col">
								<b className="text-xs font-semibold text-foreground">Your booking is confirmed</b>
								<span className="text-[11px] text-muted-foreground">to f•••@mail.com · just now</span>
							</div>
						</div>
						<div className="flex flex-wrap gap-1.5">
							<span className="flex h-5.5 items-center rounded-full bg-primary-soft px-2 text-[11px] font-medium text-primary">
								Confirmed
							</span>
							<span className="flex h-5.5 items-center rounded-full border border-border bg-card px-2 text-[11px] text-body">
								Tue 24 Nov · 10:30
							</span>
						</div>
					</WayCard>

					<WayCard
						icon={<DoorOpen className="size-6" aria-hidden="true" />}
						iconTone="teal"
						title="Walk in 24/7"
						text="Come to reception any time. We find the next open slot and check you in on the spot."
						dark
					>
						<div className="flex items-center justify-between">
							<span className="font-heading text-2xl font-bold tracking-tight text-white">Next: 10:45</span>
							<span className="flex h-5 items-center gap-1 rounded-full bg-teal-500/20 px-2 text-[11px] font-medium text-teal-300">
								<CircleCheck className="size-3" />
								Checked in
							</span>
						</div>
						<span className="text-xs text-slate-300">Pay at the desk · doctor sees you in slot order</span>
					</WayCard>
				</div>
			</div>
		</section>
	);
}

interface WayCardProps {
	icon: ReactNode;
	iconTone?: "blue" | "teal";
	title: string;
	text: string;
	dark?: boolean;
	children: ReactNode;
}

function WayCard({ icon, iconTone = "blue", title, text, dark, children }: WayCardProps) {
	return (
		<article className="flex flex-col gap-3.5 rounded-xl border border-border bg-card p-6 shadow-card md:p-7">
			<span
				className={
					iconTone === "teal"
						? "flex size-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700"
						: "flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary"
				}
			>
				{icon}
			</span>
			<h3 className="font-heading text-xl font-bold text-foreground">{title}</h3>
			<p className="text-[15px] leading-relaxed text-body">{text}</p>
			<div
				aria-hidden="true"
				className={
					dark
						? "mt-auto flex flex-col gap-2 rounded-[10px] bg-inverse p-3.5"
						: "mt-auto flex flex-col gap-2.5 rounded-[10px] border border-border bg-background p-3.5"
				}
			>
				{children}
			</div>
		</article>
	);
}
