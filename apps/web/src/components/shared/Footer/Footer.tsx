import { Logo } from "@/components/shared/Logo";
import { footerNavGroups } from "@/lib/publicNavItems";
import Link from "next/link";

export function Footer() {
	return (
		<footer className="bg-inverse text-inverse-foreground">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 pt-16 pb-8 md:px-8 md:pt-18">
				<div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-12">
					<div className="col-span-2 flex flex-col gap-4 md:col-span-5">
						<Logo variant="inverse" />
						<address className="text-sm leading-relaxed not-italic">
							120 Riverside Avenue
							<br />
							Springfield, ST 00000
						</address>
						<div className="flex flex-wrap items-center gap-2.5 text-sm">
							<span className="inline-flex h-7 items-center gap-2 rounded-full bg-teal-500/20 px-3 text-[13px] font-medium text-teal-300">
								<span
									aria-hidden="true"
									className="size-1.75 rounded-full bg-teal-400 motion-safe:animate-live-pulse"
								/>
								Open 24/7
							</span>
							<span>
								Emergency:{" "}
								<a
									href="tel:+15550100199"
									className="rounded-sm font-semibold text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
								>
									(555) 010-0199
								</a>
							</span>
						</div>
					</div>

					{footerNavGroups.map((group, index) => (
						<nav
							key={group.title}
							aria-label={group.title}
							className={index === footerNavGroups.length - 1 ? "md:col-span-3" : "md:col-span-2"}
						>
							<h2 className="mb-3 font-sans text-[13px] font-semibold tracking-normal text-white">{group.title}</h2>
							<ul className="flex flex-col gap-3">
								{group.items.map((item) => (
									<li key={item.href}>
										<Link
											href={item.href}
											className="rounded-sm text-sm transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
										>
											{item.title}
										</Link>
									</li>
								))}
							</ul>
						</nav>
					))}
				</div>

				<div className="flex flex-col gap-2 border-t border-white/10 pt-6 text-[13px] text-slate-400 md:flex-row md:justify-between">
					<p>© 2026 ClinicOS — portfolio project</p>
					<p>Made with the ClinicOS “Calm &amp; Clear” design system</p>
				</div>
			</div>
		</footer>
	);
}
