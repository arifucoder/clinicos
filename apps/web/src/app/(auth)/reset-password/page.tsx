import { ResetPasswordForm } from "@/components/modules/auth/ResetPasswordForm";
import { Skeleton } from "@/components/ui/skeleton";
import { forgetPasswordSchema } from "@/zod/auth.validation";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: "Reset password",
};

export default function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
	return (
		<Suspense fallback={<ResetSkeleton />}>
			<ResetPasswordContent searchParams={searchParams} />
		</Suspense>
	);
}

async function ResetPasswordContent({ searchParams }: Pick<PageProps<"/reset-password">, "searchParams">) {
	const { email } = await searchParams;
	const parsed = forgetPasswordSchema.shape.email.safeParse(typeof email === "string" ? email : "");

	if (!parsed.success) {
		return (
			<div className="space-y-4">
				<h1 className="text-[32px] leading-10 font-bold tracking-[-0.03em]">Link not complete</h1>
				<p className="text-[15px] text-slate-700">This page needs your email address. Request a new reset code.</p>
				<Link href="/forgot-password" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
					Forgot password
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h1 className="text-[32px] leading-10 font-bold tracking-[-0.03em]">Set a new password</h1>
				<p className="text-[15px] text-slate-700">
					If an account exists for <span className="font-semibold text-foreground">{parsed.data}</span>, we sent it a
					6-digit code.
				</p>
			</div>

			<ResetPasswordForm email={parsed.data} />

			<p className="text-center text-xs text-muted-foreground">
				Wrong email?{" "}
				<Link href="/forgot-password" className="font-medium text-primary underline-offset-4 hover:underline">
					Start again
				</Link>
			</p>
		</div>
	);
}

function ResetSkeleton() {
	return (
		<div className="space-y-6" aria-busy="true">
			<Skeleton className="h-10 w-3/4" />
			<Skeleton className="h-12 w-full" />
			<Skeleton className="h-11.5 w-full" />
			<Skeleton className="h-11.5 w-full" />
			<Skeleton className="h-12 w-full" />
		</div>
	);
}
