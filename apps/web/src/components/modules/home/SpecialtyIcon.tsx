import { icons, Stethoscope } from "lucide-react";

// admin specialty-তে lucide-এর নাম লেখে ("HeartPulse")। ভুল বা খালি হলে Stethoscope।
// শুধু server component-এ ব্যবহার করো: `icons` পুরো icon set, client bundle-এ গেলে অনেক বড় হতো
export function SpecialtyIcon({ name, className }: { name: string | null; className?: string }) {
	const Icon = (name && icons[name as keyof typeof icons]) || Stethoscope;
	return <Icon className={className} aria-hidden="true" />;
}
