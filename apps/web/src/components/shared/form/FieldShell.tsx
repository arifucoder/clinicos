import { Label } from "@/components/ui/label";
import type { ReactNode } from "react";

interface FieldShellProps {
	id: string;
	label: string;
	optional?: boolean;
	error?: string;
	hint?: string;
	children: ReactNode;
}

export function FieldShell({ id, label, optional, error, hint, children }: FieldShellProps) {
	const message = error ?? hint;

	return (
		<div className="space-y-2">
			<Label htmlFor={id} className="text-[13px]">
				{label}
				{optional && <span className="font-normal text-muted-foreground">(optional)</span>}
			</Label>
			{children}
			{message && (
				<p id={`${id}-message`} className={error ? "text-sm text-destructive" : "text-xs text-muted-foreground"}>
					{message}
				</p>
			)}
		</div>
	);
}
