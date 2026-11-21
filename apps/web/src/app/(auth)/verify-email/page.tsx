import { VerifyEmailForm } from "@/components/modules/auth/VerifyEmailForm";
import { Skeleton } from "@/components/ui/skeleton";
import { resendOtpSchema } from "@/zod/auth.validation";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: "Verify your email",
};

export default function VerifyEmailPage({ searchParams }: PageProps<"/verify-email">) {
	return (
		<Suspense fallback={<VerifyEmailSkeleton />}>
			<VerifyEmailContent searchParams={searchParams} />
		</Suspense>
	);
}

async function VerifyEmailContent({ searchParams }: Pick<PageProps<"/verify-email">, "searchParams">) {
	const { email: rawEmail } = await searchParams;

	// URL-ও user input — বিশ্বাস না করে যাচাই
	const parsed = resendOtpSchema.shape.email.safeParse(typeof rawEmail === "string" ? rawEmail : "");
	if (!parsed.success) return <MissingEmail />;

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h1 className="text-[32px] leading-10 font-bold tracking-[-0.03em]">Check your email</h1>
				<p className="text-[15px] text-slate-700">
					We sent a 6-digit code to <span className="font-semibold text-foreground">{parsed.data}</span>
				</p>
			</div>

			<VerifyEmailForm email={parsed.data} />

			<p className="text-center text-xs text-muted-foreground">
				Wrong email?{" "}
				<Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
					Sign up again
				</Link>
			</p>
		</div>
	);
}

function MissingEmail() {
	return (
		<div className="space-y-4">
			<h1 className="text-[32px] leading-10 font-bold tracking-[-0.03em]">Link not complete</h1>
			<p className="text-[15px] text-slate-700">
				This page needs your email address. Sign up again, or log in if you already verified your email.
			</p>
			<div className="flex gap-4 text-sm font-medium">
				<Link href="/signup" className="text-primary underline-offset-4 hover:underline">
					Sign up
				</Link>
				<Link href="/login" className="text-primary underline-offset-4 hover:underline">
					Log in
				</Link>
			</div>
		</div>
	);
}

function VerifyEmailSkeleton() {
	return (
		<div className="space-y-6" aria-busy="true">
			<Skeleton className="h-10 w-3/4" />
			<Skeleton className="h-5 w-full" />
			<Skeleton className="h-12 w-full" />
			<Skeleton className="h-12 w-full" />
		</div>
	);
}
