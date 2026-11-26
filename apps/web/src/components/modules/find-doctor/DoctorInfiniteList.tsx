"use client";

import { loadPublicDoctorsAction } from "@/actions/doctor.action";
import { DoctorCard } from "@/components/modules/find-doctor/DoctorCard";
import { DoctorCardSkeleton } from "@/components/modules/find-doctor/FindDoctorSkeleton";
import { Button } from "@/components/ui/button";
import { pluralize } from "@/lib/format";
import type { PaginationMeta } from "@/types/api.types";
import type { PublicDoctor } from "@/types/doctor.types";
import type { PublicDoctorListQuery } from "@/zod/doctor.validation";
import { Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
	initialDoctors: PublicDoctor[];
	initialMeta: PaginationMeta;
	query: PublicDoctorListQuery;
	today: string;
};

// The parent gives this a `key` per query, so new filters start again from page 1.
export function DoctorInfiniteList({ initialDoctors, initialMeta, query, today }: Props) {
	const [doctors, setDoctors] = useState(initialDoctors);
	const [meta, setMeta] = useState(initialMeta);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const loadingRef = useRef(false);
	const sentinelRef = useRef<HTMLDivElement>(null);

	const hasMore = meta.page < meta.totalPages;

	const loadMore = useCallback(async () => {
		if (loadingRef.current || !hasMore) return;
		loadingRef.current = true;
		setLoading(true);
		setError(null);

		const result = await loadPublicDoctorsAction(query, meta.page + 1);
		if (result.success) {
			setDoctors((current) => {
				const seen = new Set(current.map((doctor) => doctor.id));
				return [...current, ...result.data.doctors.filter((doctor) => !seen.has(doctor.id))];
			});
			setMeta(result.data.meta);
		} else {
			setError(result.message);
		}

		loadingRef.current = false;
		setLoading(false);
	}, [hasMore, meta.page, query]);

	// load the next page when the sentinel below the grid comes near the viewport
	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel || !hasMore || error) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) void loadMore();
			},
			{ rootMargin: "400px 0px" },
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [hasMore, error, loadMore]);

	return (
		<div className="flex flex-col gap-5">
			<ul aria-labelledby="results-heading" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
				{doctors.map((doctor) => (
					<li key={doctor.id}>
						<DoctorCard doctor={doctor} today={today} />
					</li>
				))}
				{loading &&
					Array.from({ length: 3 }, (_, index) => (
						<li key={`loading-${index}`} aria-hidden="true">
							<DoctorCardSkeleton />
						</li>
					))}
			</ul>

			<div ref={sentinelRef} aria-live="polite" className="flex flex-col items-center gap-2 pt-2">
				{error ? (
					<>
						<p className="text-[13px] text-destructive">{error}</p>
						<Button variant="outline" className="h-10 bg-card" onClick={() => void loadMore()}>
							<RefreshCw aria-hidden="true" />
							Try again
						</Button>
					</>
				) : hasMore ? (
					<Button variant="outline" className="h-10 bg-card font-semibold" onClick={() => void loadMore()} disabled={loading}>
						{loading ? (
							<>
								<Loader2 aria-hidden="true" className="animate-spin" />
								Loading more doctors…
							</>
						) : (
							"Load more doctors"
						)}
					</Button>
				) : (
					<p className="text-[13px] text-body tabular-nums">Showing all {pluralize(meta.total, "doctor")}</p>
				)}
			</div>
		</div>
	);
}
