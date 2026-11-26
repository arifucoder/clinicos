import { LegalPage } from "@/components/modules/legal/LegalPage";
import { CreditCard, Database, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Privacy policy",
	description: "What ClinicOS collects, why we need it, who can see your records and the choices you have.",
};

export default function PrivacyPage() {
	return (
		<LegalPage
			eyebrow="Legal"
			title="Privacy policy"
			intro="We only collect what we need to book your visits and care for you, and we never sell your data."
			updated="26 November 2026"
			highlights={[
				{
					icon: <Database className="size-5.5" aria-hidden="true" />,
					title: "Only what care needs",
					text: "Your contact details, appointments and the notes your doctor writes. Nothing for advertising.",
				},
				{
					icon: <ShieldCheck className="size-5.5" aria-hidden="true" />,
					title: "Records stay private",
					text: "Only your doctors and the clinic staff who book and check you in can see your records.",
				},
				{
					icon: <CreditCard className="size-5.5" aria-hidden="true" />,
					title: "Cards stay with Stripe",
					text: "Online payments are handled by Stripe. We never see or store your card number.",
				},
			]}
			sections={[
				{
					id: "what-we-collect",
					title: "What we collect",
					body: (
						<>
							<p>When you create an account or book a visit, we keep:</p>
							<ul>
								<li>
									<strong>Account details:</strong> your name, email, phone number and password (stored only as a secure
									hash).
								</li>
								<li>
									<strong>Patient profile:</strong> date of birth, gender, blood group, allergies and address.
								</li>
								<li>
									<strong>Visits:</strong> your appointments, reasons for visit, prescriptions and follow-up dates.
								</li>
								<li>
									<strong>Payments:</strong> the amount, status and date of each payment, but never your card details.
								</li>
							</ul>
						</>
					),
				},
				{
					id: "how-we-use-it",
					title: "How we use it",
					body: (
						<ul>
							<li>To book, confirm and remind you about appointments.</li>
							<li>To let your doctor see your history and write prescriptions.</li>
							<li>To send account emails, such as verification codes, booking confirmations and password resets.</li>
							<li>To take payments and keep the clinic&apos;s records accurate.</li>
						</ul>
					),
				},
				{
					id: "who-can-see",
					title: "Who can see your records",
					body: (
						<>
							<p>
								Access depends on each person&apos;s role. <strong>Doctors</strong> see the patients they treat,{" "}
								<strong>front-desk admins</strong> see what they need to book and check you in, and you see your own
								appointments and prescriptions in the patient portal.
							</p>
							<p>
								We share data only with the services that run the site: Stripe for payments, our email provider for
								account emails and Cloudinary for doctor photos.
							</p>
						</>
					),
				},
				{
					id: "cookies",
					title: "Cookies",
					body: (
						<p>
							We use secure, HTTP-only cookies to keep you signed in. They can&apos;t be read by scripts on the page.
							We don&apos;t use advertising or tracking cookies.
						</p>
					),
				},
				{
					id: "your-choices",
					title: "Your choices",
					body: (
						<p>
							You can update your profile and change your password in the patient portal at any time. To correct a
							record or close your account, call the front desk and we&apos;ll help you.
						</p>
					),
				},
			]}
		/>
	);
}
