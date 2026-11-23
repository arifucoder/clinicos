import { SignupForm } from "@/components/modules/auth/SignupForm";
import { Skeleton } from "@/components/ui/skeleton";
import { isSafeRelativePath, withNext } from "@/lib/authRedirect";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: "Create an account",
};

export default function SignupPage({ searchParams }: PageProps<"/signup">) {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h1 className="text-[32px] leading-10 font-bold tracking-[-0.03em]">Create your patient account</h1>
				<p className="text-[15px] text-slate-700">Book faster and keep every visit in one place.</p>
			</div>

			<Suspense fallback={<SignupSkeleton />}>
				<SignupWithParams searchParams={searchParams} />
			</Suspense>

			<p className="text-center text-xs text-muted-foreground">
				Patients only — staff accounts are created by the hospital.
			</p>
		</div>
	);
}

async function SignupWithParams({ searchParams }: Pick<PageProps<"/signup">, "searchParams">) {
	const { next } = await searchParams;
	const safeNext = isSafeRelativePath(next) ? next : undefined;

	return (
		<>
			<SignupForm next={safeNext} />
			<p className="text-center text-sm text-muted-foreground">
				Already have an account?{" "}
				<Link href={withNext("/login", safeNext)} className="font-medium text-primary underline-offset-4 hover:underline">
					Log in
				</Link>
			</p>
		</>
	);
}

function SignupSkeleton() {
	return (
		<div className="space-y-5" aria-busy="true">
			<Skeleton className="h-11.5 w-full" />
			<Skeleton className="h-11.5 w-full" />
			<Skeleton className="h-11.5 w-full" />
			<Skeleton className="h-12 w-full" />
		</div>
	);
}
