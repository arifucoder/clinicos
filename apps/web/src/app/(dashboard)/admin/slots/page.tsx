import { DoctorPicker } from "@/components/modules/slot/DoctorPicker";
import { OpenSlotsButton } from "@/components/modules/slot/OpenSlotsDialog";
import { SlotBoard } from "@/components/modules/slot/SlotBoard";
import { SlotsSkeleton } from "@/components/modules/slot/SlotsSkeleton";
import { WeekNav } from "@/components/modules/slot/WeekNav";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { addDays, clinicToday } from "@/lib/clinicDate";
import { fillWeek } from "@/lib/slotBoard";
import { DoctorService } from "@/services/doctor.service";
import { SlotService } from "@/services/slot.service";
import type { SlotDoctorOption } from "@/types/slot.types";
import { doctorListQuerySchema } from "@/zod/doctor.validation";
import { BOARD_DAYS, slotPageQuerySchema } from "@/zod/slot.validation";
import { isAxiosError } from "axios";
import { Stethoscope, UserX } from "lucide-react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Doctors & slots" };

type SearchParams = PageProps<"/admin/slots">["searchParams"];

const ACTIVE_DOCTORS_QUERY = doctorListQuerySchema.parse({
	isActive: "true",
	limit: 100,
	sortBy: "user.name",
	sortOrder: "asc",
});

const loadSlots = async (doctorId: string, range: { from: string; to: string }) => {
	try {
		const response = await SlotService.getManageSlots(doctorId, range);
		return response.data;
	} catch (error) {
		if (isAxiosError(error) && error.response?.status === 404) return "NOT_FOUND" as const;
		throw error;
	}
};

export default function AdminSlotsPage({ searchParams }: PageProps<"/admin/slots">) {
	return (
		<Suspense fallback={<SlotsSkeleton withPicker />}>
			<SlotsContent searchParams={searchParams} />
		</Suspense>
	);
}

async function SlotsContent({ searchParams }: { searchParams: SearchParams }) {
	const query = slotPageQuerySchema.parse(await searchParams);

	await connection();
	const now = new Date();
	const today = clinicToday(now);
	const from = query.from ?? today;
	const to = addDays(from, BOARD_DAYS - 1);

	const [doctorsResponse, slotDays] = await Promise.all([
		DoctorService.getDoctors(ACTIVE_DOCTORS_QUERY),
		query.doctorId ? loadSlots(query.doctorId, { from, to }) : Promise.resolve(null),
	]);

	const doctors: SlotDoctorOption[] = doctorsResponse.data.map((doctor) => ({
		id: doctor.id,
		name: doctor.user.name,
		specialties: doctor.specialties.map((specialty) => specialty.name).join(", "),
	}));

	return (
		<div className="space-y-5">
			<PageHeader
				title="Doctors & slots"
				actions={<OpenSlotsButton doctorId={query.doctorId ?? null} today={today} />}
			/>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<DoctorPicker doctors={doctors} value={query.doctorId} />
				<WeekNav from={from} today={today} />
			</div>

			{!query.doctorId || slotDays === null ? (
				<div className="rounded-xl border border-border bg-card">
					<EmptyState
						icon={Stethoscope}
						title="Pick a doctor"
						description="Choose a doctor to see and manage their slots."
					/>
				</div>
			) : slotDays === "NOT_FOUND" ? (
				<div className="rounded-xl border border-border bg-card">
					<EmptyState
						icon={UserX}
						title="Doctor not found"
						description="They may have been deleted. Pick another doctor."
					/>
				</div>
			) : (
				<SlotBoard
					key={`${query.doctorId}-${from}`}
					doctorId={query.doctorId}
					days={fillWeek(from, slotDays)}
					today={today}
					now={now.toISOString()}
				/>
			)}
		</div>
	);
}
