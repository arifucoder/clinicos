import { Footer } from "@/components/shared/Footer/Footer";
import { Navbar } from "@/components/shared/Navbar/Navbar";
import { TopStrip } from "@/components/shared/Navbar/TopStrip";

export default function PublicLayout({ children }: LayoutProps<"/">) {
	return (
		<>
			<a
				href="#main"
				className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
			>
				Skip to content
			</a>
			<TopStrip />
			<Navbar />
			<main id="main" className="flex-1">
				{children}
			</main>
			<Footer />
		</>
	);
}
