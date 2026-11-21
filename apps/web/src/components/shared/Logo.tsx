import { cn } from "@/lib/utils";
import Link from "next/link";

type LogoVariant = "default" | "inverse";

interface LogoMarkProps {
	variant?: LogoVariant;
	className?: string;
}

export function LogoMark({ variant = "default", className }: LogoMarkProps) {
	const isInverse = variant === "inverse";

	return (
		<svg viewBox="0 0 40 40" aria-hidden="true" className={cn("size-8 shrink-0", className)}>
			<rect x="14" y="2" width="12" height="36" rx="6" className={isInverse ? "fill-blue-500" : "fill-primary"} />
			<rect
				x="2"
				y="14"
				width="36"
				height="12"
				rx="6"
				className={
					isInverse
						? "fill-teal-500 opacity-90"
						: "fill-success mix-blend-multiply dark:opacity-90 dark:mix-blend-normal"
				}
			/>
		</svg>
	);
}

interface LogoProps extends LogoMarkProps {
	href?: string;
}

export function Logo({ variant = "default", href = "/", className }: LogoProps) {
	const isInverse = variant === "inverse";

	return (
		<Link
			href={href}
			aria-label="ClinicOS General Hospital home"
			className={cn(
				"inline-flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
				className,
			)}
		>
			<LogoMark variant={variant} />
			<span className="flex flex-col leading-[1.1]">
				<span
					className={cn("font-heading text-lg font-bold tracking-tight", isInverse ? "text-white" : "text-foreground")}
				>
					Clinic<span className={isInverse ? "text-blue-300" : "text-primary"}>OS</span>
				</span>
				<span
					className={cn(
						"text-[11px] font-medium tracking-wider uppercase",
						isInverse ? "text-slate-400" : "text-muted-foreground",
					)}
				>
					General hospital
				</span>
			</span>
		</Link>
	);
}
