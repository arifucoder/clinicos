"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

type ParamValue = string | number | null | undefined;

export function useTableUrlState() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();

	const setParams = useCallback(
		(patch: Record<string, ParamValue>, options?: { resetPage?: boolean }) => {
			const next = new URLSearchParams(searchParams.toString());

			for (const [key, value] of Object.entries(patch)) {
				if (value === null || value === undefined || value === "") next.delete(key);
				else next.set(key, String(value));
			}
			if (options?.resetPage) next.delete("page");

			const query = next.toString();
			startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
		},
		[pathname, router, searchParams],
	);

	return { searchParams, setParams, isPending };
}
