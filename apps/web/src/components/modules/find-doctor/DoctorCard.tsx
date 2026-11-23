import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatNextAvailable } from "@/lib/clinicDate";
import { FIND_DOCTOR_PATH } from "@/lib/findDoctor";
import { formatCents } from "@/lib/format";
import { getInitials } from "@/lib/userDisplay";
import type { PublicDoctor } from "@/types/doctor.types";
import Link from "next/link";

export function DoctorCard({ doctor, today }: { doctor: PublicDoctor; today: string }) {
	const profileHref = `${FIND_DOCTOR_PATH}/${doctor.id}`;
	const specialtyNames = doctor.specialties.map((specialty) => specialty.name).join(", ");

	return (
		<article className="grid grid-cols-[56px_minmax(0,1fr)] gap-x-4 gap-y-4 rounded-xl border border-border bg-card p-4 shadow-card sm:grid-cols-[72px_minmax(0,1fr)_200px] sm:gap-5 sm:px-6 sm:py-5">
			<Avatar className="size-14 sm:size-18">
				{doctor.photoUrl && <AvatarImage src={doctor.photoUrl} alt="" className="object-cover" />}
				<AvatarFallback className="bg-primary-soft font-heading text-lg font-bold text-primary sm:text-[22px]">
					{getInitials(doctor.name)}
				</AvatarFallback>
			</Avatar>

			<div className="flex min-w-0 flex-col gap-1">
				<h3 className="font-heading text-lg leading-snug font-bold text-foreground">
					<Link
						href={profileHref}
						className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
					>
						{doctor.name}
					</Link>
				</h3>
				{specialtyNames && <p className="text-sm text-body">{specialtyNames}</p>}
				{doctor.bio && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{doctor.bio}</p>}
				{doctor.roomNumber && <p className="mt-1 text-[13px] text-muted-foreground">Room {doctor.roomNumber}</p>}
			</div>

			{/* mobile: নিচে আলাদা সারি (fee + next বাঁয়ে, button ডানে); sm থেকে ডান দিকের column */}
			<div className="col-span-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-t border-border pt-4 sm:col-span-1 sm:flex sm:flex-col sm:items-end sm:gap-3 sm:border-0 sm:pt-0 sm:text-right">
				<p className="flex items-baseline gap-1.5 sm:flex-col sm:items-end sm:gap-0.5">
					<span className="font-heading text-xl font-bold text-foreground tabular-nums sm:text-[22px]">
						{formatCents(doctor.consultationFeeCents)}
					</span>
					<span className="text-xs text-muted-foreground">per visit</span>
				</p>

				<p className="col-start-1 text-[13px] text-body">
					{doctor.nextAvailableAt ? (
						<>
							Next:{" "}
							<span className="font-semibold text-primary tabular-nums">
								{formatNextAvailable(doctor.nextAvailableAt, today)}
							</span>
						</>
					) : (
						<span className="text-muted-foreground">No open slots soon</span>
					)}
				</p>

				<Button
					variant="outline"
					render={<Link href={profileHref} aria-label={`View profile of ${doctor.name}`} />}
					nativeButton={false}
					className="col-start-2 row-span-2 row-start-1 h-10 font-semibold sm:w-full"
				>
					View profile
				</Button>
			</div>
		</article>
	);
}
