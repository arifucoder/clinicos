import { DataTableSearch } from "@/components/shared/data-table/DataTableSearch";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { BOOK_PATH } from "@/lib/deskBooking";
import type { PatientRecord } from "@/types/patient.types";
import { Search, UserPlus, UserX } from "lucide-react";
import Link from "next/link";

interface PatientResultsProps {
	searchTerm?: string;
	patients: PatientRecord[] | null; // null = এখনো খোঁজা হয়নি
}

export function PatientResults({ searchTerm, patients }: PatientResultsProps) {
	return (
		<section className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-card md:p-5">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
				<DataTableSearch placeholder="Search name, phone or email" />
				<Button
					variant="outline"
					className="sm:ml-auto"
					render={<Link href={`${BOOK_PATH}?new=1`} />}
					nativeButton={false}
				>
					<UserPlus aria-hidden="true" />
					Create new patient
				</Button>
			</div>

			{patients === null ? (
				<EmptyState
					icon={Search}
					title="Find the patient"
					description="Search by name, phone or email. New here? Create a patient."
				/>
			) : patients.length === 0 ? (
				<EmptyState
					icon={UserX}
					title={`No patient matches "${searchTerm}"`}
					description="Check the spelling, or create a new patient."
				/>
			) : (
				<ul className="divide-y divide-border rounded-lg border border-border">
					{patients.map((patient) => (
						<li key={patient.id} className="flex items-center justify-between gap-3 px-4 py-3">
							<div className="min-w-0">
								<p className="truncate font-medium text-foreground">{patient.fullName}</p>
								<p className="truncate text-sm text-muted-foreground">
									{[patient.phone, patient.user.email].filter(Boolean).join(" · ")}
								</p>
							</div>
							{/* বন্ধ account-এ api 404 দেয় → আগেই আটকাই */}
							{patient.user.isActive ? (
								<Button size="sm" render={<Link href={`${BOOK_PATH}?patientId=${patient.id}`} />} nativeButton={false}>
									Select
								</Button>
							) : (
								<span className="shrink-0 text-xs text-muted-foreground">Account off</span>
							)}
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
