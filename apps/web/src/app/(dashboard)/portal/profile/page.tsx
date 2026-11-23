import { MyProfileForm } from "@/components/modules/portal/MyProfileForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CHANGE_PASSWORD_PATH, isSafeRelativePath } from "@/lib/authRedirect";
import { PATIENT_BOOK_PATH } from "@/lib/doctorProfile";
import { formatDate } from "@/lib/format";
import { PatientService } from "@/services/patient.service";
import type { MyPatientProfile } from "@/types/patient.types";
import { Info, KeyRound, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";

export const metadata: Metadata = { title: "My profile" };

export default function PortalProfilePage({ searchParams }: PageProps<"/portal/profile">) {
	return (
		<div className="max-w-3xl space-y-5">
			<PageHeader
				title="My profile"
				actions={
					<Button variant="outline" render={<Link href={CHANGE_PASSWORD_PATH} />} nativeButton={false}>
						<KeyRound aria-hidden="true" />
						Change password
					</Button>
				}
			/>
			<Suspense fallback={<ProfileSkeleton />}>
				<ProfileContent searchParams={searchParams} />
			</Suspense>
		</div>
	);
}

async function ProfileContent({ searchParams }: Pick<PageProps<"/portal/profile">, "searchParams">) {
	const { next } = await searchParams;
	const returnTo = isSafeRelativePath(next) && next.startsWith(`${PATIENT_BOOK_PATH}?`) ? next : undefined;

	const response = await PatientService.getMyProfile();
	const profile = response.data;

	return (
		<>
			{!profile.profileComplete && (
				<p
					role="status"
					className="flex items-start gap-2 rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning-foreground"
				>
					<Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
					{returnTo
						? "Add your phone, date of birth and gender, then save — we'll take you back to your booking."
						: "Complete your profile to book an appointment — we need your phone, date of birth and gender."}
				</p>
			)}

			<AccountCard profile={profile} />
			<MyProfileForm key={profile.updatedAt} profile={profile} returnTo={returnTo} />
		</>
	);
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="space-y-1">
			<dt className="text-xs font-medium text-muted-foreground">{label}</dt>
			<dd className="text-sm text-foreground">{children}</dd>
		</div>
	);
}

function AccountCard({ profile }: { profile: MyPatientProfile }) {
	return (
		<section
			aria-labelledby="account-heading"
			className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-card md:p-6"
		>
			<div className="space-y-1">
				<h2 id="account-heading" className="font-heading text-lg font-semibold text-foreground">
					{profile.fullName}
				</h2>
				<p className="text-xs text-muted-foreground">
					To change your name, email or allergies, please contact the front desk.
				</p>
			</div>

			<dl className="grid gap-5 sm:grid-cols-2">
				<InfoRow label="Email">
					<span className="break-all">{profile.email}</span>
				</InfoRow>
				<InfoRow label="Patient since">{formatDate(profile.createdAt)}</InfoRow>
				<div className="sm:col-span-2">
					<InfoRow label="Allergies">
						{profile.allergies ? (
							<span className="inline-flex items-start gap-1.5 rounded-md bg-danger-soft px-2 py-1 text-danger-foreground">
								<TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
								{profile.allergies}
							</span>
						) : (
							<span className="text-muted-foreground">None recorded</span>
						)}
					</InfoRow>
				</div>
			</dl>
		</section>
	);
}

function ProfileSkeleton() {
	return (
		<div className="space-y-5" aria-busy="true">
			<Skeleton className="h-36 rounded-xl" />
			<div className="space-y-5 rounded-xl border border-border bg-card p-5 md:p-6">
				<div className="grid gap-5 sm:grid-cols-2">
					{Array.from({ length: 6 }, (_, i) => (
						<Skeleton key={i} className="h-16" />
					))}
				</div>
				<Skeleton className="ml-auto h-10 w-32" />
			</div>
		</div>
	);
}
