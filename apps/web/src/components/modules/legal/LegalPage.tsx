import { eyebrowClass, sectionClass } from "@/components/modules/home/homeStyles";
import { Button } from "@/components/ui/button";
import { CLINIC_INFO } from "@/lib/clinicInfo";
import { FIND_DOCTOR_PATH } from "@/lib/findDoctor";
import { Info, Phone } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export interface LegalHighlight {
	icon: ReactNode;
	title: string;
	text: string;
}

export interface LegalSection {
	id: string;
	title: string;
	body: ReactNode;
}

interface LegalPageProps {
	eyebrow: string;
	title: string;
	intro: string;
	updated: string;
	highlights: LegalHighlight[];
	sections: LegalSection[];
}

const linkClass = "rounded-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring";

export function LegalPage({ eyebrow, title, intro, updated, highlights, sections }: LegalPageProps) {
	return (
		<>
			{/* header */}
			<section className="relative overflow-hidden border-b border-border bg-card">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(#CBD5E1_1px,transparent_1.3px)] [background-size:22px_22px] [mask-image:linear-gradient(to_left,#000,transparent_60%)] md:block"
				/>
				<div className={`${sectionClass} relative flex flex-col gap-3 py-8 md:py-12`}>
					<nav aria-label="Breadcrumb" className="text-[13px] text-muted-foreground">
						<Link href="/" className={linkClass}>
							Home
						</Link>{" "}
						<span aria-hidden="true">/</span>{" "}
						<span aria-current="page" className="text-body">
							{title}
						</span>
					</nav>
					<p className={eyebrowClass}>{eyebrow}</p>
					<h1 className="font-heading text-[30px] font-bold tracking-[-0.03em] text-foreground md:text-[44px]">{title}</h1>
					<p className="max-w-160 text-base leading-relaxed text-body md:text-[17px]">{intro}</p>
					<p className="text-[13px] text-muted-foreground">Last updated {updated}</p>
				</div>
			</section>

			{/* at a glance */}
			<section aria-labelledby="glance-heading" className={`${sectionClass} pt-10 md:pt-14`}>
				<h2 id="glance-heading" className="sr-only">
					At a glance
				</h2>
				<ul className="grid gap-4 md:grid-cols-3 md:gap-5">
					{highlights.map((item) => (
						<li key={item.title} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-card">
							<span className="flex size-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
								{item.icon}
							</span>
							<h3 className="font-heading text-[17px] font-bold text-foreground">{item.title}</h3>
							<p className="text-sm leading-relaxed text-body">{item.text}</p>
						</li>
					))}
				</ul>
			</section>

			{/* details */}
			<div className={`${sectionClass} grid gap-8 py-10 md:py-14 lg:grid-cols-[220px_1fr] lg:gap-12`}>
				<nav aria-label="On this page" className="hidden lg:block">
					<div className="sticky top-24 flex flex-col gap-1">
						<p className="px-3 pb-1.5 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
							On this page
						</p>
						{sections.map((section) => (
							<a
								key={section.id}
								href={`#${section.id}`}
								className="rounded-lg px-3 py-1.5 text-sm text-body transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
							>
								{section.title}
							</a>
						))}
					</div>
				</nav>

				<div className="flex min-w-0 flex-col gap-4">
					<p className="flex gap-3 rounded-xl border border-primary-soft bg-primary-soft/60 p-4 text-sm leading-relaxed text-body">
						<Info className="mt-0.5 size-4.5 shrink-0 text-primary" aria-hidden="true" />
						<span>
							ClinicOS is a portfolio project. The clinic, doctors and patients on this site are demo data, so please
							don&apos;t enter real medical information.
						</span>
					</p>

					{sections.map((section) => (
						<section
							key={section.id}
							id={section.id}
							aria-labelledby={`${section.id}-heading`}
							className="scroll-mt-24 rounded-xl border border-border bg-card p-5 md:p-7"
						>
							<h2
								id={`${section.id}-heading`}
								className="mb-3 font-heading text-xl font-bold tracking-[-0.01em] text-foreground md:text-[22px]"
							>
								{section.title}
							</h2>
							<div className="flex flex-col gap-3 text-[15px] leading-relaxed text-body [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-5">
								{section.body}
							</div>
						</section>
					))}
				</div>
			</div>

			{/* contact */}
			<section aria-labelledby="legal-contact-heading" className={`${sectionClass} pb-18 md:pb-24`}>
				<div className="relative flex flex-col gap-6 overflow-hidden rounded-2xl border border-primary-soft bg-primary-soft/60 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-12 md:py-12">
					<div
						aria-hidden="true"
						className="pointer-events-none absolute -top-30 -right-20 size-90 rounded-full bg-[radial-gradient(closest-side,rgb(37_99_235/0.18),transparent)]"
					/>
					<div className="relative flex flex-col gap-2">
						<h2
							id="legal-contact-heading"
							className="font-heading text-2xl font-bold tracking-[-0.02em] text-foreground md:text-3xl"
						>
							Questions about this page?
						</h2>
						<p className="text-base text-body">
							Call the front desk any time, or visit us at {CLINIC_INFO.addressLine}.
						</p>
					</div>
					<div className="relative flex flex-col gap-3 sm:flex-row">
						<Button
							size="lg"
							className="h-12 px-5.5 text-[15px] font-semibold"
							render={<a href={`tel:${CLINIC_INFO.tel}`} />}
							nativeButton={false}
						>
							<Phone />
							Call {CLINIC_INFO.phone}
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="h-12 border-primary-soft bg-card px-5 text-[15px] font-semibold"
							render={<Link href={FIND_DOCTOR_PATH} />}
							nativeButton={false}
						>
							Find a doctor
						</Button>
					</div>
				</div>
			</section>
		</>
	);
}
