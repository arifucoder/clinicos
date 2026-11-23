import { ChangePasswordForm } from "@/components/modules/account/ChangePasswordForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { getHomeForRole } from "@/lib/authRedirect";
import { getCurrentUser } from "@/lib/currentUser";
import { Info, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Change password" };

export default function ChangePasswordPage() {
	return (
		<div className="max-w-xl space-y-5">
			<PageHeader title="Change password" />
			<Suspense fallback={<FormSkeleton />}>
				<ChangePasswordContent />
			</Suspense>
		</div>
	);
}

async function ChangePasswordContent() {
	const me = await getCurrentUser();
	if (!me) redirect("/session-expired");

	return (
		<>
			{me.needPasswordChange ? (
				<p
					role="status"
					className="flex items-start gap-2 rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning-foreground"
				>
					<Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
					You signed in with a temporary password. Set your own password to keep your account safe.
				</p>
			) : (
				<p className="flex items-start gap-2 rounded-lg bg-primary-soft px-4 py-3 text-sm text-body">
					<ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
					After you change it, you stay logged in here and every other device is logged out.
				</p>
			)}

			<section aria-label="Change password form" className="rounded-xl border border-border bg-card p-5 md:p-6">
				<ChangePasswordForm redirectTo={me.needPasswordChange ? getHomeForRole(me.role) : undefined} />
			</section>
		</>
	);
}

function FormSkeleton() {
	return (
		<div className="space-y-5" aria-busy="true">
			<Skeleton className="h-12 w-full rounded-lg" />
			<div className="space-y-5 rounded-xl border border-border bg-card p-5 md:p-6">
				{Array.from({ length: 3 }, (_, i) => (
					<div key={i} className="space-y-2">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-10 w-full" />
					</div>
				))}
				<Skeleton className="h-10 w-40" />
			</div>
		</div>
	);
}
