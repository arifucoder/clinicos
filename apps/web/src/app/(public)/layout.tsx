import { Navbar } from "@/components/shared/Navbar/Navbar";
import { TopStrip } from "@/components/shared/Navbar/TopStrip";

export default function PublicLayout({ children }: LayoutProps<"/">) {
	return (
		<>
			<TopStrip />
			<Navbar />
			<main className="flex-1">{children}</main>
		</>
	);
}
