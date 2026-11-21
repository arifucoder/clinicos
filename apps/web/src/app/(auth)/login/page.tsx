import { LoginForm } from "@/components/modules/auth/LoginForm";
import { Skeleton } from "@/components/ui/skeleton";
import { loginSchema } from "@/zod/auth.validation";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: "Log in",
};

export default function LoginPage({ searchParams }: PageProps<"/login">) {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h1 className="text-[32px] leading-10 font-bold tracking-[-0.03em]">Welcome back</h1>
				<p className="text-[15px] text-slate-700">Log in to book doctors and see your visits.</p>
			</div>

			<Suspense fallback={<LoginFormSkeleton />}>
				<LoginFormWithParams searchParams={searchParams} />
			</Suspense>

			<p className="text-center text-sm text-muted-foreground">
				New patient?{" "}
				<Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
					Create an account
				</Link>
			</p>
			<p className="text-center text-xs text-muted-foreground">Staff accounts are provided by the hospital.</p>
		</div>
	);
}

async function LoginFormWithParams({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
	const { email, next } = await searchParams;

	const parsedEmail = loginSchema.shape.email.safeParse(typeof email === "string" ? email : "");

	return (
		<LoginForm
			defaultEmail={parsedEmail.success ? parsedEmail.data : ""}
			next={typeof next === "string" ? next : undefined}
		/>
	);
}

function LoginFormSkeleton() {
	return (
		<div className="space-y-5" aria-busy="true">
			<Skeleton className="h-11.5 w-full" />
			<Skeleton className="h-11.5 w-full" />
			<Skeleton className="h-12 w-full" />
		</div>
	);
}
