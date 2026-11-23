import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatNextAvailable } from "@/lib/clinicDate";
import { formatCents } from "@/lib/format";
import { getInitials } from "@/lib/userDisplay";
import type { PublicDoctor } from "@/types/doctor.types";
import { MessageCircle } from "lucide-react";

export function DoctorHero({ doctor, today }: { doctor: PublicDoctor; today: string }) {
	const specialtyNames = doctor.specialties.map((specialty) => specialty.name).join(", ");

	const facts = [
		{ label: "Fee", value: `${formatCents(doctor.consultationFeeCents)} / visit` },
		{ label: "Where", value: doctor.roomNumber ? `Room ${doctor.roomNumber}` : "Ask at the front desk" },
		{
			label: "Next available",
			value: doctor.nextAvailableAt ? formatNextAvailable(doctor.nextAvailableAt, today) : "No open slots soon",
		},
	];

	return (
		<section className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card md:p-7">
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -top-40 -right-30 size-105 rounded-full bg-[radial-gradient(closest-side,rgb(37_99_235/0.12),transparent)]"
			/>
			<div className="relative flex flex-col gap-5 sm:flex-row sm:gap-6">
				<div className="flex items-center gap-4 sm:items-start">
					<Avatar className="size-18 border-4 border-card shadow-[0_0_0_1px_var(--color-primary-soft)] sm:size-26">
						{doctor.photoUrl && <AvatarImage src={doctor.photoUrl} alt="" className="object-cover" />}
						<AvatarFallback className="bg-primary-soft font-heading text-2xl font-bold text-primary sm:text-[34px]">
							{getInitials(doctor.name)}
						</AvatarFallback>
					</Avatar>
					<div className="flex min-w-0 flex-col gap-1 sm:hidden">
						<h1 className="font-heading text-[22px] leading-tight font-bold tracking-tight text-foreground">
							{doctor.name}
						</h1>
						{specialtyNames && <p className="text-sm font-medium text-foreground">{specialtyNames}</p>}
					</div>
				</div>

				<div className="flex min-w-0 flex-1 flex-col gap-2.5">
					<div className="hidden flex-col gap-1.5 sm:flex">
						<h1 className="font-heading text-[30px] leading-tight font-bold tracking-tight text-foreground">
							{doctor.name}
						</h1>
						{specialtyNames && <p className="text-base font-medium text-foreground">{specialtyNames}</p>}
					</div>

					<dl className="grid grid-cols-2 gap-2.5 sm:mt-1.5 sm:grid-cols-3 sm:gap-3">
						{facts.map((fact, index) => (
							<div
								key={fact.label}
								className={
									index === facts.length - 1
										? "col-span-2 rounded-[10px] border border-border bg-background px-3.5 py-3 sm:col-span-1"
										: "rounded-[10px] border border-border bg-background px-3.5 py-3"
								}
							>
								<dt className="text-xs text-muted-foreground">{fact.label}</dt>
								<dd className="mt-0.5 text-[15px] font-semibold text-foreground tabular-nums">{fact.value}</dd>
							</div>
						))}
					</dl>

					<p className="flex items-start gap-2 text-[13px] text-body">
						<MessageCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
						Questions are answered during your visit, not by message.
					</p>
				</div>
			</div>
		</section>
	);
}
