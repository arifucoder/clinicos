import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import Link from "next/link";

// এটা আসলে link (নতুন page-এ যায়), তাই <a> render করি, <button> না
export function NewPatientButton() {
	return (
		<Button render={<Link href="/admin/patients/new" />} nativeButton={false} className="h-10 px-4">
			<UserPlus aria-hidden="true" />
			New patient
		</Button>
	);
}
