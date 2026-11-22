"use client";

import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useTransition } from "react";

interface AutoRefreshProps {
	/** কত পরপর (ms)। default 5 সেকেন্ড (SDLC 7.1) */
	intervalMs?: number;
	/** false হলে বন্ধ (যেমন পুরনো দিনের তালিকা) */
	enabled?: boolean;
}

// server component-এর data নির্দিষ্ট সময় পরপর নতুন করে আনে।
// Tab লুকানো থাকলে থামে → কেউ না দেখলে VPS-এ request যায় না।
export function AutoRefresh({ intervalMs = 5000, enabled = true }: AutoRefreshProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	// useEffectEvent: সবসময় সর্বশেষ isPending পড়ে (পুরনো closure না), অথচ effect-এর dependency লাগে না।
	// আগে ref-এ render-এর সময় লিখতাম → React-এর নিয়ম ভাঙে (render pure থাকতে হবে)
	const refresh = useEffectEvent(() => {
		// আগের refresh শেষ না হলে আরেকটা পাঠাই না (ধীর network-এ request জমে না)
		if (document.visibilityState !== "visible" || isPending) return;
		startTransition(() => router.refresh());
	});

	useEffect(() => {
		if (!enabled) return;

		const intervalId = window.setInterval(refresh, intervalMs);
		// অন্য tab থেকে ফিরলে ৫ সেকেন্ড অপেক্ষা না করে সাথে সাথে একবার
		document.addEventListener("visibilitychange", refresh);

		return () => {
			window.clearInterval(intervalId);
			document.removeEventListener("visibilitychange", refresh);
		};
	}, [intervalMs, enabled]);

	return null;
}
