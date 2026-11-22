import { DoctorPicker } from "@/components/modules/slot/DoctorPicker";
import { OpenSlotsButton } from "@/components/modules/slot/OpenSlotsDialog";
import { SlotBoard } from "@/components/modules/slot/SlotBoard";
import { WeekNav } from "@/components/modules/slot/WeekNav";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { addDays, clinicToday, dateRange } from "@/lib/clinicDate";
import { DoctorService } from "@/services/doctor.service";
import { SlotService } from "@/services/slot.service";
import type { ManageSlotDay, SlotDoctorOption } from "@/types/slot.types";
import { doctorListQuerySchema } from "@/zod/doctor.validation";
import { BOARD_DAYS, slotPageQuerySchema } from "@/zod/slot.validation";
import { isAxiosError } from "axios";
import { Stethoscope, UserX } from "lucide-react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Doctors & slots" };

type SearchParams = PageProps<"/admin/slots">["searchParams"];

// picker-এর জন্য: active doctor, নাম অনুযায়ী (api-র limit সর্বোচ্চ 100)
const ACTIVE_DOCTORS_QUERY = doctorListQuerySchema.parse({
	isActive: "true",
	limit: 100,
	sortBy: "user.name",
	sortOrder: "asc",
});

// ভুল/মোছা doctorId → error page না, সুন্দর empty state
const loadSlots = async (doctorId: string, range: { from: string; to: string }) => {
	try {
		const response = await SlotService.getManageSlots(doctorId, range);
		return response.data;
	} catch (error) {
		if (isAxiosError(error) && error.response?.status === 404) return "NOT_FOUND" as const;
		throw error;
	}
};

// api শুধু যেদিন slot আছে সেদিন দেয় → ৭ দিনই দেখাতে খালি দিন বসাই
const fillWeek = (from: string, slotDays: ManageSlotDay[]): ManageSlotDay[] => {
	const byDate = new Map(slotDays.map((day) => [day.date, day.slots]));
	return dateRange(from, BOARD_DAYS).map((date) => ({ date, slots: byDate.get(date) ?? [] }));
};

export default function AdminSlotsPage({ searchParams }: PageProps<"/admin/slots">) {
	return (
		<Suspense fallback={<SlotsSkeleton />}>
			<SlotsContent searchParams={searchParams} />
		</Suspense>
	);
}

async function SlotsContent({ searchParams }: { searchParams: SearchParams }) {
	const query = slotPageQuerySchema.parse(await searchParams);

	// connection(): Next-কে বলি "এটা request-time-এ চালাও, prerender কোরো না"।
	// এর পরেই new Date() নিরাপদ (httpClient-এর createInstance-এও একই নিয়ম)
	await connection();
	const now = new Date();
	const today = clinicToday(now);
	const from = query.from ?? today;
	const to = addDays(from, BOARD_DAYS - 1);

	// দুটো call একটা আরেকটার উপর নির্ভর করে না → একসাথে
	const [doctorsResponse, slotDays] = await Promise.all([
		DoctorService.getDoctors(ACTIVE_DOCTORS_QUERY),
		query.doctorId ? loadSlots(query.doctorId, { from, to }) : Promise.resolve(null),
	]);

	// client-এ শুধু যা লাগে
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
					// doctor বা সপ্তাহ বদলালে selection নতুন করে শুরু
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

function SlotsSkeleton() {
	return (
		<div className="space-y-5">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-56" />
				<Skeleton className="h-10 w-32" />
			</div>
			<div className="flex flex-wrap justify-between gap-3">
				<Skeleton className="h-9 w-80" />
				<Skeleton className="h-9 w-64" />
			</div>
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
				{Array.from({ length: BOARD_DAYS }, (_, index) => (
					<Skeleton key={index} className="h-64 rounded-xl" />
				))}
			</div>
		</div>
	);
}
