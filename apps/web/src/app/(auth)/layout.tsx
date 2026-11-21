import { Logo } from "@/components/shared/Logo";
import { FileText, ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: LayoutProps<"/">) {
	return (
		<div className="grid min-h-svh flex-1 lg:grid-cols-[592px_1fr]">
			<div className="flex flex-col px-6 pt-7 pb-6 sm:px-14">
				<Logo />
				<main id="main" className="flex flex-1 items-center justify-center py-10">
					<div className="w-full max-w-100">{children}</div>
				</main>
				<footer className="text-xs text-muted-foreground">© 2026 ClinicOS — portfolio project</footer>
			</div>

			<AuthShowcase />
		</div>
	);
}

function AuthShowcase() {
	return (
		<aside className="relative hidden overflow-hidden bg-primary-soft lg:flex lg:flex-col lg:items-center lg:justify-center lg:px-12">
			{/* পেছনের dot pattern, কিনারায় মিলিয়ে যায় */}
			<div
				aria-hidden="true"
				className="absolute inset-0 bg-[radial-gradient(var(--color-primary)_1px,transparent_1px)] opacity-20 [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]"
			/>
			{/* বড় নরম গোল আলো */}
			<div
				aria-hidden="true"
				className="absolute top-17 left-1/2 size-155 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,white_0%,transparent_70%)]"
			/>

			{/* Product snippet — শুধু সাজানো, তাই aria-hidden */}
			<div aria-hidden="true" className="relative h-97.5 w-102">
				<div className="absolute top-0 left-10 w-92 overflow-hidden rounded-[20px] bg-slate-900 p-6 text-white shadow-[0_30px_60px_-20px_rgb(15_23_42/0.4)]">
					<div className="absolute -top-16 -right-10 size-55 rounded-full bg-primary/40 blur-3xl" />
					<div className="relative flex items-center justify-between">
						<span className="text-[11px] font-semibold tracking-[0.06em] text-slate-300 uppercase">
							Your appointment
						</span>
						<span className="inline-flex items-center gap-1.5 rounded-full bg-teal-600/25 px-2 py-0.5 text-[11px] font-medium text-teal-300">
							<span className="size-1.5 rounded-full bg-teal-400" />
							Live
						</span>
					</div>
					<p className="relative mt-4 font-heading text-6xl font-bold tracking-tight">4:30 PM</p>
					<p className="relative mt-3 text-sm text-slate-300">
						<span className="font-semibold text-white">Checked in</span> · 2 patients before you
					</p>
					<div className="relative mt-3 h-1.5 rounded-full bg-white/15">
						<div className="h-full w-[78%] rounded-full bg-blue-500" />
					</div>
					<p className="relative mt-4 text-[13px] text-slate-300">Dr. Nadia Rahman · Room 3</p>
				</div>

				<div className="absolute top-72 left-0 flex w-65 items-center gap-2.5 rounded-xl border bg-background p-3.5 shadow-lg">
					<span className="grid size-9 place-items-center rounded-[10px] bg-success-soft">
						<FileText className="size-4.5 text-success-foreground" />
					</span>
					<span className="flex flex-col">
						<span className="text-[13px] font-semibold">Prescription ready</span>
						<span className="text-xs font-semibold text-primary">View prescription</span>
					</span>
				</div>

				<div className="absolute top-75.5 left-40 w-60 rounded-xl border bg-background p-3.5 shadow-lg">
					<p className="text-[11px] text-muted-foreground">Consultation fee · 10 Nov</p>
					<p className="mt-0.5 text-[15px] font-semibold">৳800</p>
					<span className="mt-1 inline-block rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success-foreground">
						Paid
					</span>
				</div>
			</div>

			<div className="relative mt-11 max-w-md text-center">
				<h2 className="text-2xl font-bold tracking-tight">Your visit, live — on your phone</h2>
				<p className="mt-3 text-sm text-slate-700">
					<ShieldCheck className="mr-1.5 inline size-4 -translate-y-px text-success-foreground" aria-hidden="true" />
					Your records are private and only shared with your care team.
				</p>
			</div>
		</aside>
	);
}
