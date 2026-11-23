import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatNextAvailable } from "@/lib/clinicDate";
import { FIND_DOCTOR_PATH } from "@/lib/findDoctor";
import { formatCents } from "@/lib/format";
import { getInitials } from "@/lib/userDisplay";
import { cn } from "@/lib/utils";
import type { PublicDoctor } from "@/types/doctor.types";
import { CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";

// grid card: উপরে ছবি + তথ্য, নিচে ধূসর band-এ fee আর Book
export function DoctorCard({ doctor, today }: { doctor: PublicDoctor; today: string }) {
	const profileHref = `${FIND_DOCTOR_PATH}/${doctor.id}`;
	const [primary, ...others] = doctor.specialties;
	const next = doctor.nextAvailableAt;
	const freeToday = next ? formatNextAvailable(next, today).startsWith("Today") : false;

	return (
		<article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
			<div className="flex flex-1 gap-4 p-4 sm:p-5">
				<div className="relative shrink-0">
					<Avatar className="h-32 w-24 rounded-lg after:rounded-lg sm:h-36 sm:w-27">
						{doctor.photoUrl && <AvatarImage src={doctor.photoUrl} alt="" className="rounded-lg object-cover" />}
						<AvatarFallback className="rounded-lg bg-primary-soft font-heading text-2xl font-bold text-primary">
							{getInitials(doctor.name)}
						</AvatarFallback>
					</Avatar>
					{/* teal = আজই খালি, নীল = পরে খালি; রং ছাড়াও নিচের লেখায় একই তথ্য আছে */}
					{next && (
						<span
							aria-hidden="true"
							className={cn(
								"absolute top-2 right-2 size-3 rounded-full ring-2 ring-card",
								freeToday ? "bg-teal-600" : "bg-primary",
							)}
						/>
					)}
				</div>

				<div className="flex min-w-0 flex-1 flex-col gap-2">
					<h3 className="font-heading text-[17px] leading-snug font-bold text-foreground">
						<Link
							href={profileHref}
							className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
						>
							{doctor.name}
						</Link>
					</h3>

					{primary && (
						<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
							<span className="rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
								{primary.name}
							</span>
							{others.map((specialty) => (
								<span key={specialty.slug} className="text-xs font-medium text-primary">
									{specialty.name}
								</span>
							))}
						</div>
					)}

					{doctor.bio && <p className="line-clamp-2 text-[13px] text-body">{doctor.bio}</p>}

					<div className="mt-auto flex flex-col gap-1 pt-1 text-[13px]">
						{doctor.roomNumber && (
							<span className="flex items-center gap-1.5 text-muted-foreground">
								<MapPin className="size-3.5 shrink-0" aria-hidden="true" />
								Room {doctor.roomNumber}
							</span>
						)}
						<span className="flex items-center gap-1.5">
							<CalendarDays className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
							{next ? (
								<span className="text-body">
									Next:{" "}
									<b className={cn("font-semibold tabular-nums", freeToday ? "text-teal-700" : "text-primary")}>
										{formatNextAvailable(next, today)}
									</b>
								</span>
							) : (
								<span className="text-muted-foreground">No open slots soon</span>
							)}
						</span>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between gap-3 border-t border-border bg-background px-4 py-3.5 sm:px-5">
				<div className="flex flex-col">
					<span className="text-xs text-muted-foreground">Per consultation</span>
					<span className="font-heading text-xl font-bold text-foreground tabular-nums">
						{formatCents(doctor.consultationFeeCents)}
					</span>
				</div>
				<Button
					variant="outline"
					className="h-10 border-primary bg-card px-4 font-semibold text-primary hover:bg-primary-soft hover:text-primary"
					render={
						<Link
							href={profileHref}
							aria-label={next ? `Book an appointment with ${doctor.name}` : `View profile of ${doctor.name}`}
						/>
					}
					nativeButton={false}
				>
					<CalendarDays aria-hidden="true" />
					{next ? "Book appointment" : "View profile"}
				</Button>
			</div>
		</article>
	);
}
