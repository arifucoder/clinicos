import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { formatDateOfBirth } from "@/lib/patientDisplay";
import type { PatientStats } from "@/types/stats.types";
import { CalendarClock, FileText } from "lucide-react";
import Link from "next/link";

interface LastVisitCardProps {
	visit: PatientStats["lastVisit"];
	today: string; // "YYYY-MM-DD" (clinic-এর আজ)
}

export function LastVisitCard({ visit, today }: LastVisitCardProps) {
	if (!visit) return null; // প্রথম visit-এর আগে কিছু দেখানোর নেই

	const followUp = visit.prescription?.followUpDate ?? null;
	// @db.Date → "YYYY-MM-DD" অংশ তুলনা করলেই হয়; আজ বা পরে হলে "আসন্ন"
	const followUpDue = followUp !== null && followUp.slice(0, 10) >= today;

	return (
		<section
			aria-labelledby="last-visit-heading"
			className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-card md:p-6"
		>
			<div className="space-y-1">
				<h2 id="last-visit-heading" className="font-heading text-base font-semibold text-foreground">
					Last visit
				</h2>
				<p className="text-sm text-muted-foreground">
					{formatDate(visit.startAt)} · {visit.doctor.user.name}
				</p>
			</div>

			<div className="space-y-1">
				<p className="text-xs font-medium text-muted-foreground">Diagnosis</p>
				<p className="text-sm text-foreground">{visit.prescription?.diagnosis ?? "Not recorded"}</p>
			</div>

			{followUp && (
				<p
					className={
						followUpDue
							? "flex items-start gap-2 rounded-lg bg-primary-soft px-3 py-2 text-sm text-body"
							: "flex items-start gap-2 text-sm text-muted-foreground"
					}
				>
					<CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
					{/* calendar date, কোনো মুহূর্ত না → UTC formatter (formatDateOfBirth-এর মতো) */}
					{followUpDue ? "Follow-up due on " : "Follow-up was on "}
					{formatDateOfBirth(followUp)}
				</p>
			)}

			<div className="flex flex-wrap gap-2">
				{visit.prescription && (
					<Button
						variant="outline"
						render={<Link href={`/portal/appointments/${visit.id}/print`} />}
						nativeButton={false}
					>
						<FileText aria-hidden="true" />
						View prescription
					</Button>
				)}
				{followUpDue && (
					<Button render={<Link href="/doctors" />} nativeButton={false}>
						Book follow-up
					</Button>
				)}
			</div>
		</section>
	);
}
