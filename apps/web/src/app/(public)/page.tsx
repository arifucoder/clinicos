import { AtAGlance } from "@/components/modules/home/AtAGlance";
import { DoctorsToday } from "@/components/modules/home/DoctorsToday";
import { HomeCta } from "@/components/modules/home/HomeCta";
import { HomeFaq } from "@/components/modules/home/HomeFaq";
import { HomeHero } from "@/components/modules/home/HomeHero";
import { PortalSection } from "@/components/modules/home/PortalSection";
import { SpecialtyChips } from "@/components/modules/home/SpecialtyChips";
import { ThreeWays } from "@/components/modules/home/ThreeWays";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: { absolute: "ClinicOS General Hospital — book a doctor online, 24/7" },
	description:
		"Find a doctor by specialty, see open times and book in two minutes. Pay online or at the clinic. Open 24/7.",
};

export default function HomePage() {
	return (
		<>
			<HomeHero />
			<SpecialtyChips />
			<DoctorsToday />
			<ThreeWays />
			<PortalSection />
			<AtAGlance />
			<HomeFaq />
			<HomeCta />
		</>
	);
}
