import { EmptyState } from "@/components/shared/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DoctorStat } from "@/types/stats.types";
import { Stethoscope } from "lucide-react";

const percent = (part: number, whole: number) => (whole === 0 ? "—" : `${Math.round((part / whole) * 100)}%`);

export function DoctorStatsTable({ doctors, days }: { doctors: DoctorStat[]; days: number }) {
	return (
		<section aria-labelledby="doctor-heading" className="rounded-xl border border-border bg-card shadow-card">
			<h2 id="doctor-heading" className="px-5 pt-5 pb-3 font-heading text-base font-semibold text-foreground">
				By doctor · last {days} days
			</h2>

			{doctors.length === 0 ? (
				<EmptyState icon={Stethoscope} title="No appointments yet" description="Doctor numbers will show up here." />
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="pl-5">Doctor</TableHead>
							<TableHead className="text-right">Total</TableHead>
							<TableHead className="text-right">Completed</TableHead>
							<TableHead className="text-right">No-show</TableHead>
							<TableHead className="text-right">Cancelled</TableHead>
							<TableHead className="pr-5 text-right">No-show rate</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{doctors.map((doctor) => (
							<TableRow key={doctor.doctorId}>
								<TableCell className="pl-5 font-medium text-foreground">{doctor.name}</TableCell>
								<TableCell className="text-right tabular-nums">{doctor.total}</TableCell>
								<TableCell className="text-right tabular-nums">{doctor.completed}</TableCell>
								<TableCell className="text-right tabular-nums">{doctor.noShow}</TableCell>
								<TableCell className="text-right tabular-nums">{doctor.cancelled}</TableCell>
								<TableCell className="pr-5 text-right tabular-nums">{percent(doctor.noShow, doctor.total)}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</section>
	);
}
