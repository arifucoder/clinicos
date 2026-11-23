import { Button } from "@/components/ui/button";
import { formatDateOfBirth } from "@/lib/patientDisplay";
import { tileFromCalendarDate } from "@/lib/portalHome";
import Link from "next/link";
import { DateTile } from "./DateTile";

interface FollowUpCardProps {
	followUpDate: string; // @db.Date → "2026-12-31T00:00:00.000Z"
	doctorName: string;
	booked: boolean; // এই doctor-এর সাথে আসন্ন appointment আছে কিনা
}

export function FollowUpCard({ followUpDate, doctorName, booked }: FollowUpCardProps) {
	return (
		<section
			aria-labelledby="followup-heading"
			className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-card"
		>
			<h2 id="followup-heading" className="font-heading text-base font-semibold text-foreground">
				Follow-up
			</h2>

			<div className="flex items-center gap-3">
				<DateTile parts={tileFromCalendarDate(followUpDate)} />
				<div className="min-w-0">
					<p className="font-medium text-foreground">{formatDateOfBirth(followUpDate)}</p>
					<p className="text-xs text-muted-foreground">
						Suggested by {doctorName} · {booked ? "booked" : "not booked yet"}
					</p>
				</div>
			</div>

			{!booked && (
				<Button render={<Link href="/doctors" />} nativeButton={false} className="w-full">
					Book follow-up
				</Button>
			)}
		</section>
	);
}
