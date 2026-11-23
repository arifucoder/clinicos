import { DoctorProfileCard } from "@/components/modules/doctor/DoctorProfileCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CHANGE_PASSWORD_PATH } from "@/lib/authRedirect";
import { DoctorService } from "@/services/doctor.service";
import { Info, KeyRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Profile" };

export default function DoctorProfilePage() {
	return (
		<div className="max-w-3xl space-y-5">
			<PageHeader
				title="Profile"
				actions={
					<Button variant="outline" render={<Link href={CHANGE_PASSWORD_PATH} />} nativeButton={false}>
						<KeyRound aria-hidden="true" />
						Change password
					</Button>
				}
			/>

			<p className="flex items-start gap-2 rounded-lg bg-primary-soft px-4 py-3 text-sm text-body">
				<Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
				You can edit your name, phone, bio and photo. License, fee, specialties and room are managed by the clinic —
				contact an admin to change them.
			</p>

			<Suspense fallback={<ProfileSkeleton />}>
				<ProfileContent />
			</Suspense>
		</div>
	);
}

async function ProfileContent() {
	const response = await DoctorService.getMyProfile();
	return <DoctorProfileCard doctor={response.data} />;
}

function ProfileSkeleton() {
	return (
		<div className="space-y-6 rounded-xl border border-border bg-card p-5 md:p-6">
			<div className="flex items-center gap-4">
				<Skeleton className="size-20 rounded-full" />
				<div className="space-y-2">
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-5 w-32" />
				</div>
			</div>
			<div className="grid gap-5 sm:grid-cols-2">
				{Array.from({ length: 6 }, (_, i) => (
					<Skeleton key={i} className="h-10" />
				))}
			</div>
		</div>
	);
}
