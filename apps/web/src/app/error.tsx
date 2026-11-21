"use client";

import { Logo } from "@/components/shared/Logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { House, RotateCw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface ErrorPageProps {
	error: unknown;
	retry: () => void;
}

export default function ErrorPage({ error, retry }: ErrorPageProps) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	const digest =
		error instanceof Error && "digest" in error && typeof error.digest === "string" ? error.digest : undefined;

	return (
		<div className="flex flex-1 flex-col bg-surface">
			<header className="mx-auto w-full max-w-7xl px-5 py-5 md:px-8">
				<Logo />
			</header>

			<main id="main" className="flex flex-1 items-center justify-center px-5 pb-16 md:px-8">
				<section
					role="alert"
					aria-labelledby="error-title"
					className="w-full max-w-lg rounded-xl border border-border bg-card p-8 text-center shadow-raised md:p-10"
				>
					<div className="mx-auto flex size-14 items-center justify-center rounded-full bg-danger-soft text-destructive">
						<TriangleAlert className="size-7" aria-hidden="true" />
					</div>

					<p className="mt-6 text-sm font-semibold tracking-wider text-danger-foreground uppercase">
						Something went wrong
					</p>
					<h1
						id="error-title"
						className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl"
					>
						We couldn&apos;t load this page
					</h1>
					<p className="mt-3 text-body">
						This is a problem on our side, not yours. Please try again. If it keeps happening, contact the front desk.
					</p>

					<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
						<Button size="lg" className="px-4" onClick={() => retry()}>
							<RotateCw aria-hidden="true" />
							Try again
						</Button>
						<Link href="/" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-4")}>
							<House aria-hidden="true" />
							Back to home
						</Link>
					</div>

					{digest && (
						<p className="mt-8 text-xs text-muted-foreground">
							Error ID: <code className="rounded-sm bg-muted px-1.5 py-0.5 font-mono">{digest}</code>
						</p>
					)}
				</section>
			</main>
		</div>
	);
}
