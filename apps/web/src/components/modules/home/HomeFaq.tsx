import { CLINIC_INFO } from "@/lib/clinicInfo";
import { ChevronDown } from "lucide-react";
import { eyebrowClass, bigH2Class, sectionClass } from "./homeStyles";

const FAQS = [
	{
		q: "How do I book?",
		a: "Choose a specialty and a date, pick a doctor's open time and confirm. It takes about two minutes, and the confirmation arrives by email.",
	},
	{
		q: "Can I pay at the clinic?",
		a: "Yes. Pay online by card while booking, or pay at the front desk (cash, card or mobile banking) when you arrive. Online bookings hold your time for 30 minutes while you pay.",
	},
	{
		q: "How do I cancel?",
		a: "Open “Appointments” in your patient portal and cancel. Online cancellation is free up to 2 hours before your visit; after that, please call the front desk.",
	},
	{
		q: "Do I need an account?",
		a: "To book online, yes. It's free and keeps your visits and prescriptions in one place. You can also call the front desk or walk in, and we'll set it up for you.",
	},
	{
		q: "What if I'm late?",
		a: "Your visit is booked for a set time, so tell the front desk as soon as you arrive. They'll fit you in if they can, or help you pick a new time.",
	},
];

export function HomeFaq() {
	return (
		<section id="faq" aria-labelledby="faq-heading" className="scroll-mt-20 border-t border-border">
			<div className={`${sectionClass} grid gap-8 py-18 md:py-24 lg:grid-cols-12 lg:gap-6`}>
				<div className="flex flex-col gap-2.5 lg:col-span-4">
					<p className={eyebrowClass}>FAQ</p>
					<h2 id="faq-heading" className={bigH2Class}>
						Questions, answered
					</h2>
					<p className="text-base text-body">Can&apos;t find what you need? The front desk is open around the clock.</p>
					<a href={`tel:${CLINIC_INFO.tel}`} className="w-fit text-[15px] font-semibold text-primary hover:underline">
						Call {CLINIC_INFO.phone}
					</a>
				</div>

				<div className="flex flex-col gap-3 lg:col-span-7 lg:col-start-6">
					{FAQS.map((faq, index) => (
						<details
							key={faq.q}
							open={index === 0}
							className="group rounded-xl border border-border bg-card shadow-card"
						>
							<summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-4.5 text-base font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:px-6 md:py-5 [&::-webkit-details-marker]:hidden">
								{faq.q}
								<ChevronDown
									className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
									aria-hidden="true"
								/>
							</summary>
							<p className="px-5 pb-5 text-[15px] leading-relaxed text-body md:px-6 md:pb-5.5">{faq.a}</p>
						</details>
					))}
				</div>
			</div>
		</section>
	);
}
