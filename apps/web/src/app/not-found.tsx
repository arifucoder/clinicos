import { Logo } from "@/components/shared/Logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { House, Phone, SearchX, Stethoscope } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Page not found",
};

export default function NotFound() {
	return (
		<div className="flex flex-1 flex-col bg-surface">
			<header className="mx-auto w-full max-w-7xl px-5 py-5 md:px-8">
				<Logo />
			</header>

			<main id="main" className="flex flex-1 items-center justify-center px-5 pb-16 md:px-8">
				<section
					aria-labelledby="not-found-title"
					className="w-full max-w-lg rounded-xl border border-border bg-card p-8 text-center shadow-raised md:p-10"
				>
					<div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
						<SearchX className="size-7" aria-hidden="true" />
					</div>

					<p className="mt-6 text-sm font-semibold tracking-wider text-primary uppercase">Error 404</p>
					<h1
						id="not-found-title"
						className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl"
					>
						We couldn&apos;t find that page
					</h1>
					<p className="mt-3 text-body">
						The link may be broken, or the page may have moved. Let&apos;s get you back on track.
					</p>

					<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
						<Link href="/" className={cn(buttonVariants({ size: "lg" }), "px-4")}>
							<House aria-hidden="true" />
							Back to home
						</Link>
						<Link href="/doctors" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-4")}>
							<Stethoscope aria-hidden="true" />
							Find a doctor
						</Link>
					</div>

					<p className="mt-8 flex items-center justify-center gap-2 rounded-md bg-danger-soft px-4 py-3 text-sm text-danger-foreground">
						<Phone className="size-4 shrink-0" aria-hidden="true" />
						<span>
							Medical emergency? Call{" "}
							<a
								href="tel:+15550100199"
								className="rounded-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
							>
								(555) 010-0199
							</a>
						</span>
					</p>
				</section>
			</main>
		</div>
	);
}
