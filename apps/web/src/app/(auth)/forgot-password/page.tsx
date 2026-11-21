import { ForgotPasswordForm } from "@/components/modules/auth/ForgotPasswordForm";
import { Skeleton } from "@/components/ui/skeleton";
import { forgetPasswordSchema } from "@/zod/auth.validation";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: "Forgot password",
};

export default function ForgotPasswordPage({ searchParams }: PageProps<"/forgot-password">) {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h1 className="text-[32px] leading-10 font-bold tracking-[-0.03em]">Forgot your password?</h1>
				<p className="text-[15px] text-slate-700">Enter your email and we will send you a 6-digit reset code.</p>
			</div>

			<Suspense fallback={<FormSkeleton />}>
				<ForgotPasswordFormWithParams searchParams={searchParams} />
			</Suspense>

			<p className="text-center text-sm text-muted-foreground">
				Remembered it?{" "}
				<Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
					Back to log in
				</Link>
			</p>
		</div>
	);
}

async function ForgotPasswordFormWithParams({ searchParams }: Pick<PageProps<"/forgot-password">, "searchParams">) {
	const { email } = await searchParams;
	const parsed = forgetPasswordSchema.shape.email.safeParse(typeof email === "string" ? email : "");

	return <ForgotPasswordForm defaultEmail={parsed.success ? parsed.data : ""} />;
}

function FormSkeleton() {
	return (
		<div className="space-y-5" aria-busy="true">
			<Skeleton className="h-11.5 w-full" />
			<Skeleton className="h-12 w-full" />
		</div>
	);
}
