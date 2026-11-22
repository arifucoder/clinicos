"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// একবার দেখানো temporary password + copy। patient register আর reset password দুই জায়গায় লাগে।
export function TemporaryPassword({ password }: { password: string }) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), 2000);
		return () => clearTimeout(timer);
	}, [copied]);

	const handleCopy = async () => {
		try {
			// clipboard শুধু secure context-এ চলে (https বা localhost)
			await navigator.clipboard.writeText(password);
			setCopied(true);
			toast.success("Password copied");
		} catch {
			toast.error("Couldn't copy. Select the password and copy it manually.");
		}
	};

	return (
		<div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
			<code className="flex-1 font-mono text-lg tracking-wider break-all text-foreground select-all">{password}</code>
			<Button type="button" variant="outline" size="sm" onClick={handleCopy}>
				{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
				{copied ? "Copied" : "Copy"}
			</Button>
		</div>
	);
}
