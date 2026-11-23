"use client";

import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface HoldCountdownProps {
	expiresAt: string;
	serverNowMs: number; // প্রথম render server-এর ঘড়িতে → hydration mismatch হয় না
}

const pad = (value: number) => String(value).padStart(2, "0");

// "Pay within 12:48 to keep this slot" — প্রতি সেকেন্ডে কমে; শেষ হলে page নতুন করে আনে (hold বাতিল)
export function HoldCountdown({ expiresAt, serverNowMs }: HoldCountdownProps) {
	const router = useRouter();
	const expiresMs = new Date(expiresAt).getTime();
	const [nowMs, setNowMs] = useState(serverNowMs);
	const leftMs = Math.max(0, expiresMs - nowMs);

	useEffect(() => {
		const id = window.setInterval(() => setNowMs(Date.now()), 1000);
		return () => window.clearInterval(id);
	}, []);

	useEffect(() => {
		if (leftMs === 0) router.refresh();
	}, [leftMs, router]);

	const minutes = Math.floor(leftMs / 60_000);
	const seconds = Math.floor((leftMs % 60_000) / 1000);

	return (
		<p className="flex items-center gap-2 rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning-foreground">
			<Clock className="size-4 shrink-0" aria-hidden="true" />
			{leftMs > 0 ? (
				<span>
					Pay within{" "}
					<span className="font-semibold tabular-nums" role="timer" aria-live="off">
						{pad(minutes)}:{pad(seconds)}
					</span>{" "}
					to keep this slot
				</span>
			) : (
				<span>The hold has ended — refreshing…</span>
			)}
		</p>
	);
}
