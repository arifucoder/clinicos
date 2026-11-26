import { LegalPage } from "@/components/modules/legal/LegalPage";
import { CalendarClock, CreditCard, Siren } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Terms of use",
	description: "The rules for using ClinicOS: accounts, booking, cancellations and payments.",
};

export default function TermsPage() {
	return (
		<LegalPage
			eyebrow="Legal"
			title="Terms of use"
			intro="By creating an account or booking a visit with ClinicOS, you agree to these terms. They are short, we promise."
			updated="26 November 2026"
			highlights={[
				{
					icon: <CalendarClock className="size-5.5" aria-hidden="true" />,
					title: "Your slot is held",
					text: "When you book online, we hold the time for 30 minutes while you pay. After that it opens up again.",
				},
				{
					icon: <CreditCard className="size-5.5" aria-hidden="true" />,
					title: "Pay your way",
					text: "Pay online by card or pay at the clinic. Either way, your booking is the same.",
				},
				{
					icon: <Siren className="size-5.5" aria-hidden="true" />,
					title: "Not for emergencies",
					text: "Online booking is for planned visits. In an emergency, call us or come straight to the hospital.",
				},
			]}
			sections={[
				{
					id: "accounts",
					title: "Your account",
					body: (
						<ul>
							<li>Use your real name and an email you can access, because we send verification codes there.</li>
							<li>Keep your password private. You are responsible for bookings made with your account.</li>
							<li>We may suspend an account that is used to block slots or misuse the service.</li>
						</ul>
					),
				},
				{
					id: "booking",
					title: "Booking appointments",
					body: (
						<>
							<p>
								A booking is confirmed when you pay online, or when you choose to pay at the clinic. You will see it in
								your portal and get a confirmation email.
							</p>
							<p>
								Please arrive a few minutes early so the front desk can check you in. Times are shown in the
								clinic&apos;s local time zone.
							</p>
						</>
					),
				},
				{
					id: "cancellations",
					title: "Cancellations and missed visits",
					body: (
						<ul>
							<li>You can cancel an upcoming appointment from your patient portal.</li>
							<li>If you don&apos;t arrive, the front desk may mark the visit as a no-show.</li>
							<li>For questions about refunds, call the front desk.</li>
						</ul>
					),
				},
				{
					id: "medical-advice",
					title: "Medical advice",
					body: (
						<p>
							Information on this site is general and does not replace a consultation. Your diagnosis and treatment
							come from your doctor during your visit.
						</p>
					),
				},
				{
					id: "changes",
					title: "Changes to these terms",
					body: (
						<p>
							We may update these terms as the service changes. The date at the top of this page shows the latest
							version.
						</p>
					),
				},
			]}
		/>
	);
}
