import { UserAvatar } from "@/components/layout/UserAvatar";
import { EditMyProfileButton } from "@/components/modules/doctor/EditMyProfileButton";
import { StaffStatus } from "@/components/modules/staff/StaffStatus";
import { Badge } from "@/components/ui/badge";
import { formatCents, formatDate } from "@/lib/format";
import type { StaffDoctor } from "@/types/doctor.types";
import type { ReactNode } from "react";

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="space-y-1">
			<dt className="text-xs font-medium text-muted-foreground">{label}</dt>
			<dd className="text-sm text-foreground">{children}</dd>
		</div>
	);
}

const NotSet = () => <span className="text-muted-foreground">Not set</span>;

export function DoctorProfileCard({ doctor }: { doctor: StaffDoctor }) {
	const { user } = doctor;

	return (
		<section className="space-y-6 rounded-xl border border-border bg-card p-5 shadow-card md:p-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
				<UserAvatar user={{ name: user.name, image: doctor.photoUrl }} className="size-20 text-lg" />
				<div className="min-w-0 flex-1 space-y-2">
					<h2 className="truncate font-heading text-xl font-bold text-foreground">{user.name}</h2>
					<div className="flex flex-wrap gap-1.5">
						{doctor.specialties.map((specialty) => (
							<Badge key={specialty.id} variant="secondary">
								{specialty.name}
							</Badge>
						))}
					</div>
					<StaffStatus isActive={user.isActive} needPasswordChange={false} isPaused={doctor.isPaused} />
				</div>
				<EditMyProfileButton
					defaults={{ name: user.name, phone: user.phone ?? "", bio: doctor.bio ?? "" }}
					photoUrl={doctor.photoUrl}
				/>
			</div>

			<dl className="grid gap-5 sm:grid-cols-2">
				<InfoRow label="Email">{user.email}</InfoRow>
				<InfoRow label="Phone">{user.phone ?? <NotSet />}</InfoRow>
				<InfoRow label="License number">
					<span className="font-mono">{doctor.licenseNumber}</span>
				</InfoRow>
				<InfoRow label="Consultation fee">{formatCents(doctor.consultationFeeCents)}</InfoRow>
				<InfoRow label="Room">{doctor.roomNumber ?? <NotSet />}</InfoRow>
				<InfoRow label="Member since">{formatDate(doctor.createdAt)}</InfoRow>
			</dl>

			<div className="space-y-1">
				<h3 className="text-xs font-medium text-muted-foreground">Bio</h3>
				<p className="text-sm whitespace-pre-line text-body">{doctor.bio ?? <NotSet />}</p>
			</div>
		</section>
	);
}
