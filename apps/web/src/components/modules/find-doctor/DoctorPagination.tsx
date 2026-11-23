import { Button } from "@/components/ui/button";
import { buildDoctorsHref } from "@/lib/findDoctor";
import { pluralize } from "@/lib/format";
import type { PaginationMeta } from "@/types/api.types";
import type { PublicDoctorListQuery } from "@/zod/doctor.validation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export function DoctorPagination({ meta, query }: { meta: PaginationMeta; query: PublicDoctorListQuery }) {
	const { page, limit, total, totalPages } = meta;
	if (total === 0) return null;

	const from = (page - 1) * limit + 1;
	const to = Math.min(page * limit, total);

	return (
		<nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 pt-2">
			<p className="text-[13px] text-body tabular-nums">
				Showing {from}–{to} of {pluralize(total, "doctor")}
			</p>

			{totalPages > 1 && (
				<div className="flex items-center gap-2">
					<PageLink href={page > 1 ? buildDoctorsHref(query, { page: page - 1 }) : null} label="Previous page">
						<ChevronLeft aria-hidden="true" />
						Previous
					</PageLink>
					<span className="px-1 text-[13px] text-muted-foreground tabular-nums">
						{page} / {totalPages}
					</span>
					<PageLink href={page < totalPages ? buildDoctorsHref(query, { page: page + 1 }) : null} label="Next page">
						Next
						<ChevronRight aria-hidden="true" />
					</PageLink>
				</div>
			)}
		</nav>
	);
}

function PageLink({ href, label, children }: { href: string | null; label: string; children: React.ReactNode }) {
	if (!href) {
		return (
			<Button variant="outline" className="h-10 bg-card" disabled aria-label={label}>
				{children}
			</Button>
		);
	}
	return (
		<Button
			variant="outline"
			className="h-10 bg-card font-semibold"
			render={<Link href={href} aria-label={label} />}
			nativeButton={false}
		>
			{children}
		</Button>
	);
}
