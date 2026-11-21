export function TopStrip() {
	return (
		<div className="bg-inverse text-inverse-foreground">
			<div className="mx-auto flex min-h-9 w-full max-w-7xl items-center justify-center gap-2 px-5 py-2 text-xs md:justify-between md:px-8 md:text-[13px]">
				<p className="flex items-center gap-2">
					<span
						aria-hidden="true"
						className="size-1.5 rounded-full bg-teal-400 motion-safe:animate-live-pulse md:size-[7px]"
					/>
					<span className="font-medium text-white">Open 24/7</span>
					<span aria-hidden="true">·</span>
					<span>
						Emergency:{" "}
						<a
							href="tel:+15550100199"
							className="rounded-sm font-semibold text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
						>
							(555) 010-0199
						</a>
					</span>
				</p>
				<p className="hidden md:block">Walk-ins welcome · Online booking for all departments</p>
			</div>
		</div>
	);
}
