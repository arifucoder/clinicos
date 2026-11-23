import { TriangleAlert } from "lucide-react";

export function AllergyBadge({ allergies }: { allergies: string | null }) {
	if (!allergies) return null;
	return (
		<span
			title={allergies}
			className="inline-flex max-w-full items-center gap-1 rounded-md bg-danger-soft px-1.5 py-0.5 text-xs font-medium text-danger-foreground"
		>
			<TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />
			<span className="truncate">Allergy: {allergies}</span>
		</span>
	);
}
