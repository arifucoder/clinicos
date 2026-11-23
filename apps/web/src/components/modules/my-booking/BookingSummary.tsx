import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FIND_DOCTOR_PATH } from "@/lib/findDoctor";
import { CLINIC_TIME_ZONE, formatCents } from "@/lib/format";
import { formatSlotLabel } from "@/lib/myBooking";
import { getInitials } from "@/lib/userDisplay";
import type { BookingSlot } from "@/types/appointment.types";
import type { PublicDoctor } from "@/types/doctor.types";
import { CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";

interface BookingSummaryProps {
	doctor: PublicDoctor;
	slot: BookingSlot | null;
	taken?: boolean; // slot হাতছাড়া → কেটে দেখাই
}

export function BookingSummary({ doctor, slot, taken = false }: BookingSummaryProps) {
	const specialtyNames = doctor.specialties.map((specialty) => specialty.name).join(", ");

	return (
		<aside
			aria-label="Booking summary"
			className="flex flex-col rounded-xl border border-border bg-card shadow-raised lg:sticky lg:top-24"
		>
			<div className="flex items-center justify-between px-5 pt-5 pb-4">
				<h2 className="font-heading text-base font-bold text-foreground">Your booking</h2>
				<Link
					href={`${FIND_DOCTOR_PATH}/${doctor.id}`}
					className="text-[13px] font-semibold text-primary hover:underline"
				>
					Change
				</Link>
			</div>

			<div className="flex flex-col gap-4 px-5 pb-5">
				<div className="flex items-center gap-3">
					<Avatar className="size-12">
						{doctor.photoUrl && <AvatarImage src={doctor.photoUrl} alt="" className="object-cover" />}
						<AvatarFallback className="bg-primary-soft font-heading font-bold text-primary">
							{getInitials(doctor.name)}
						</AvatarFallback>
					</Avatar>
					<div className="flex min-w-0 flex-col">
						<b className="truncate font-heading text-[15px] font-bold text-foreground">{doctor.name}</b>
						{specialtyNames && <span className="truncate text-[13px] text-body">{specialtyNames}</span>}
					</div>
				</div>

				<dl className="flex flex-col gap-3 border-t border-border pt-4 text-sm">
					<div className="flex gap-3">
						<dt className="pt-0.5">
							<CalendarDays className="size-4 text-muted-foreground" aria-label="When" />
						</dt>
						<dd className="flex flex-col gap-0.5">
							{slot ? (
								taken ? (
									<span className="flex flex-wrap items-center gap-2">
										<s className="text-muted-foreground tabular-nums">{formatSlotLabel(slot.startAt)}</s>
										<span className="rounded-full bg-danger-soft px-2 text-[11px] font-semibold text-danger-foreground">
											Taken
										</span>
									</span>
								) : (
									<b className="font-semibold text-foreground tabular-nums">{formatSlotLabel(slot.startAt)}</b>
								)
							) : (
								<span className="text-muted-foreground">Pick a new time</span>
							)}
							<span className="text-xs text-muted-foreground">Clinic time ({CLINIC_TIME_ZONE})</span>
						</dd>
					</div>
					<div className="flex gap-3">
						<dt className="pt-0.5">
							<MapPin className="size-4 text-muted-foreground" aria-label="Where" />
						</dt>
						<dd className="text-foreground">
							In person{doctor.roomNumber ? ` · Room ${doctor.roomNumber}` : ""}
						</dd>
					</div>
				</dl>

				<div className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
					<div className="flex justify-between text-body">
						<span>Consultation fee</span>
						<span className="tabular-nums">{formatCents(doctor.consultationFeeCents)}</span>
					</div>
					<div className="flex justify-between text-body">
						<span>Booking fee</span>
						<span>Free</span>
					</div>
					<div className="flex justify-between border-t border-dashed border-border pt-2 text-foreground">
						<b className="font-semibold">Total</b>
						<b className="font-semibold tabular-nums">{formatCents(doctor.consultationFeeCents)}</b>
					</div>
				</div>
			</div>

			<p className="rounded-b-xl border-t border-border bg-background px-5 py-3 text-xs text-body">
				Free cancellation up to 2 hours before your visit.
			</p>
		</aside>
	);
}
