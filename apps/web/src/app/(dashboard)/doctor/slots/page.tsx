import { OpenSlotsButton } from "@/components/modules/slot/OpenSlotsDialog";
import { SlotBoard } from "@/components/modules/slot/SlotBoard";
import { SlotsSkeleton } from "@/components/modules/slot/SlotsSkeleton";
import { WeekNav } from "@/components/modules/slot/WeekNav";
import { PageHeader } from "@/components/shared/PageHeader";
import { addDays, clinicToday } from "@/lib/clinicDate";
import { fillWeek } from "@/lib/slotBoard";
import { SlotService } from "@/services/slot.service";
import { BOARD_DAYS, slotPageQuerySchema } from "@/zod/slot.validation";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata: Metadata = { title: "My slots" };

const ME = "me";

const doctorSlotsQuerySchema = slotPageQuerySchema.pick({ from: true });

type SearchParams = PageProps<"/doctor/slots">["searchParams"];

export default function DoctorSlotsPage({ searchParams }: PageProps<"/doctor/slots">) {
	return (
		<Suspense fallback={<SlotsSkeleton />}>
			<SlotsContent searchParams={searchParams} />
		</Suspense>
	);
}

async function SlotsContent({ searchParams }: { searchParams: SearchParams }) {
	const query = doctorSlotsQuerySchema.parse(await searchParams);

	await connection();
	const now = new Date();
	const today = clinicToday(now);
	const from = query.from ?? today;
	const to = addDays(from, BOARD_DAYS - 1);

	const response = await SlotService.getManageSlots(ME, { from, to });

	return (
		<div className="space-y-5">
			<PageHeader title="My slots" actions={<OpenSlotsButton doctorId={ME} today={today} />} />

			<div className="flex sm:justify-end">
				<WeekNav from={from} today={today} />
			</div>

			<SlotBoard
				key={from}
				doctorId={ME}
				days={fillWeek(from, response.data)}
				today={today}
				now={now.toISOString()}
				emptyDescription="Use “Open slots” to add your hours, or check another week."
			/>
		</div>
	);
}
