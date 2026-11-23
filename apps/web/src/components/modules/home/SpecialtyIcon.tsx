import { icons, Stethoscope } from "lucide-react";

export function SpecialtyIcon({ name, className }: { name: string | null; className?: string }) {
	const Icon = (name && icons[name as keyof typeof icons]) || Stethoscope;
	return <Icon className={className} aria-hidden="true" />;
}
