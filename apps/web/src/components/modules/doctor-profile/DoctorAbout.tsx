import type { PublicDoctor } from "@/types/doctor.types";

const cardClass = "flex flex-col gap-3.5 rounded-xl border border-border bg-card p-5 shadow-card md:p-7";

export function DoctorAbout({ doctor }: { doctor: PublicDoctor }) {
	return (
		<section aria-labelledby="about-heading" className={cardClass}>
			<h2 id="about-heading" className="font-heading text-lg font-bold text-foreground md:text-xl">
				About
			</h2>
			<p className="text-[15px] leading-relaxed whitespace-pre-line text-body">
				{doctor.bio ?? `${doctor.name} hasn't added a bio yet.`}
			</p>
			{doctor.specialties.length > 0 && (
				<ul aria-label="Specialties" className="flex flex-wrap gap-2">
					{doctor.specialties.map((specialty) => (
						<li
							key={specialty.slug}
							className="flex h-7 items-center rounded-full bg-muted px-3 text-[13px] font-medium text-body"
						>
							{specialty.name}
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
