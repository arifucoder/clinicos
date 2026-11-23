import { Button } from "@/components/ui/button";
import { CLINIC_INFO } from "@/lib/clinicInfo";
import { FIND_DOCTOR_PATH } from "@/lib/findDoctor";
import { ArrowRight, Phone } from "lucide-react";
import Link from "next/link";
import { sectionClass } from "./homeStyles";

export function HomeCta() {
	return (
		<section aria-labelledby="cta-heading" className={`${sectionClass} pb-18 md:pb-24`}>
			<div className="relative flex flex-col gap-6 overflow-hidden rounded-2xl border border-primary-soft bg-primary-soft/60 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-12 md:py-14">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -top-30 -right-20 size-90 rounded-full bg-[radial-gradient(closest-side,rgb(37_99_235/0.18),transparent)]"
				/>
				<div className="relative flex flex-col gap-2">
					<h2 id="cta-heading" className="font-heading text-3xl font-bold tracking-[-0.03em] text-foreground md:text-[40px]">
						Book in two minutes
					</h2>
					<p className="text-base text-body md:text-[17px]">Pick a doctor, choose a time, and you&apos;re done.</p>
				</div>
				<div className="relative flex flex-col gap-3 sm:flex-row">
					<Button
						size="lg"
						className="h-12 px-5.5 text-[15px] font-semibold"
						render={<Link href={FIND_DOCTOR_PATH} />}
						nativeButton={false}
					>
						Find a doctor
						<ArrowRight />
					</Button>
					<Button
						variant="outline"
						size="lg"
						className="h-12 border-primary-soft bg-card px-5 text-[15px] font-semibold"
						render={<a href={`tel:${CLINIC_INFO.tel}`} />}
						nativeButton={false}
					>
						<Phone />
						Call {CLINIC_INFO.phone}
					</Button>
				</div>
			</div>
		</section>
	);
}
