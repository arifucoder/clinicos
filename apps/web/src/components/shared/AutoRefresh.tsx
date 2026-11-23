"use client";

import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useTransition } from "react";

interface AutoRefreshProps {
	intervalMs?: number;
	enabled?: boolean;
}

export function AutoRefresh({ intervalMs = 5000, enabled = true }: AutoRefreshProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const refresh = useEffectEvent(() => {
		if (document.visibilityState !== "visible" || isPending) return;
		startTransition(() => router.refresh());
	});

	useEffect(() => {
		if (!enabled) return;

		const intervalId = window.setInterval(refresh, intervalMs);
		document.addEventListener("visibilitychange", refresh);

		return () => {
			window.clearInterval(intervalId);
			document.removeEventListener("visibilitychange", refresh);
		};
	}, [intervalMs, enabled]);

	return null;
}
