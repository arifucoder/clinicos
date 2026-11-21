import { SignupForm } from "@/components/modules/auth/SignupForm";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Create an account",
};

export default function SignupPage() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h1 className="text-[32px] leading-10 font-bold tracking-[-0.03em]">Create your patient account</h1>
				<p className="text-[15px] text-slate-700">Book faster and keep every visit in one place.</p>
			</div>

			<SignupForm />

			<p className="text-center text-sm text-muted-foreground">
				Already have an account?{" "}
				<Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
					Log in
				</Link>
			</p>
			<p className="text-center text-xs text-muted-foreground">
				Patients only — staff accounts are created by the hospital.
			</p>
		</div>
	);
}
