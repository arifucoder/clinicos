"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import "./globals.css";

interface GlobalErrorProps {
	error: unknown;
	retry: () => void;
}

export default function GlobalError({ error, retry }: GlobalErrorProps) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	const digest =
		error instanceof Error && "digest" in error && typeof error.digest === "string" ? error.digest : undefined;

	return (
		<html lang="en" className="h-full antialiased">
			<body className="flex min-h-full flex-col items-center justify-center bg-surface px-5 py-16">
				<title>Something went wrong · ClinicOS</title>

				<main
					role="alert"
					aria-labelledby="global-error-title"
					className="w-full max-w-lg rounded-xl border border-border bg-card p-8 text-center shadow-raised md:p-10"
				>
					<p className="text-sm font-semibold tracking-wider text-danger-foreground uppercase">ClinicOS</p>
					<h1 id="global-error-title" className="mt-2 text-2xl font-bold tracking-tight text-foreground">
						Something went wrong
					</h1>
					<p className="mt-3 text-body">
						The app ran into an unexpected problem. Please try again, or reload the page.
					</p>

					<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
						<button type="button" onClick={() => retry()} className={cn(buttonVariants({ size: "lg" }), "px-4")}>
							Try again
						</button>
						{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
						<a href="/" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-4")}>
							Back to home
						</a>
					</div>

					<p className="mt-8 text-sm text-danger-foreground">
						Medical emergency? Call{" "}
						<a href="tel:+15550100199" className="font-semibold underline-offset-4 hover:underline">
							(555) 010-0199
						</a>
					</p>

					{digest && (
						<p className="mt-4 text-xs text-muted-foreground">
							Error ID: <code className="font-mono">{digest}</code>
						</p>
					)}
				</main>
			</body>
		</html>
	);
}
