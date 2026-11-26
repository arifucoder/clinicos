import { LegalPage } from "@/components/modules/legal/LegalPage";
import { Ear, Keyboard, MousePointerClick } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Accessibility",
	description: "How ClinicOS works for everyone, what we have built in and how to tell us about a problem.",
};

export default function AccessibilityPage() {
	return (
		<LegalPage
			eyebrow="Accessibility"
			title="Accessibility statement"
			intro="Everyone should be able to find a doctor and book a visit. We design ClinicOS to work with a keyboard, a screen reader and on any screen size."
			updated="26 November 2026"
			highlights={[
				{
					icon: <Keyboard className="size-5.5" aria-hidden="true" />,
					title: "Keyboard friendly",
					text: "A “Skip to content” link and clear focus outlines let you move around without a mouse.",
				},
				{
					icon: <Ear className="size-5.5" aria-hidden="true" />,
					title: "Screen reader ready",
					text: "Pages use proper headings and landmarks, and form fields and buttons have clear labels.",
				},
				{
					icon: <MousePointerClick className="size-5.5" aria-hidden="true" />,
					title: "Easy to read and tap",
					text: "Strong colour contrast, large tap targets and layouts that work from a small phone to a desktop.",
				},
			]}
			sections={[
				{
					id: "our-goal",
					title: "Our goal",
					body: (
						<p>
							We aim to meet the{" "}
							<strong>Web Content Accessibility Guidelines (WCAG) 2.2 at level AA</strong>. We check new pages
							against these guidelines as we build them.
						</p>
					),
				},
				{
					id: "what-we-do",
					title: "What we have built in",
					body: (
						<ul>
							<li>A “Skip to content” link at the top of the public pages.</li>
							<li>Visible focus outlines on links, buttons and form fields.</li>
							<li>Search results announced to screen readers when they change.</li>
							<li>Animations respect your device&apos;s “reduce motion” setting.</li>
							<li>Layouts that adapt from a small phone to a large desktop screen.</li>
						</ul>
					),
				},
				{
					id: "known-limits",
					title: "Known limitations",
					body: (
						<p>
							Some charts in the staff dashboards show data visually, and printed prescriptions are designed for
							paper. If anything is hard to use, the front desk can read out or send you the same information.
						</p>
					),
				},
				{
					id: "feedback",
					title: "Tell us about a problem",
					body: (
						<p>
							If a page doesn&apos;t work for you, call the front desk and tell us which page and what went wrong.
							We&apos;ll help you book in the meantime and fix the problem.
						</p>
					),
				},
			]}
		/>
	);
}
