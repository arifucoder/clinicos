import { EmptyState } from "@/components/shared/EmptyState";
import { MyBookingFlow } from "@/components/modules/my-booking/MyBookingFlow";
import { ProfileIncompleteCard } from "@/components/modules/my-booking/ProfileIncompleteCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FIND_DOCTOR_PATH } from "@/lib/findDoctor";
import { bookingPageHref } from "@/lib/myBooking";
import { DoctorService } from "@/services/doctor.service";
import { PatientService } from "@/services/patient.service";
import { SlotService } from "@/services/slot.service";
import type { BookingSlot } from "@/types/appointment.types";
import { myBookingPageQuerySchema } from "@/zod/appointment.validation";
import { isAxiosError } from "axios";
import { CalendarX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Book a visit" };

// URL /portal/book কিন্তু (public) group-এ: design-এর মতো public navbar, dashboard sidebar না।
// তবু /portal-এর নিচে, তাই proxy.ts শুধু PATIENT ঢুকতে দেয় (logged out → /login?next=…)
export default function MyBookingPage({ searchParams }: PageProps<"/portal/book">) {
	return (
		<div className="mx-auto w-full max-w-7xl px-4 pt-5 pb-20 md:px-8 md:pt-8">
			<Suspense fallback={<BookingSkeleton />}>
				<BookingContent searchParams={searchParams} />
			</Suspense>
		</div>
	);
}

async function BookingContent({ searchParams }: Pick<PageProps<"/portal/book">, "searchParams">) {
	const { doctorId, slotId } = myBookingPageQuerySchema.parse(await searchParams);
	if (!doctorId || !slotId) return <BadLink />;

	// তিনটা আলাদা request, একসাথে। patient: cookie দিয়ে (auth), বাকি দুটো public
	const [profileResponse, doctor, slotsResponse] = await Promise.all([
		PatientService.getMyProfile(),
		DoctorService.getPublicDoctorById(doctorId)
			.then((response) => response.data)
			.catch((error: unknown) => {
				if (isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 400)) return null;
				throw error;
			}),
		SlotService.getPublicSlots(doctorId).catch(() => null),
	]);

	if (!doctor) return <BadLink />;

	const profile = profileResponse.data;
	if (!profile.profileComplete) return <ProfileIncompleteCard returnTo={bookingPageHref(doctorId, slotId)} />;

	// slot-এর সময় URL থেকে না, api থেকে নিই। না পেলে = আর খালি নেই (booked, blocked বা সময় পেরিয়েছে)
	const openSlots: BookingSlot[] = (slotsResponse?.data.days ?? [])
		.flatMap((day) => day.slots)
		.filter((slot) => slot.status === "AVAILABLE")
		.map(({ id, startAt, endAt }) => ({ id, startAt, endAt }));
	const slot = openSlots.find((option) => option.id === slotId) ?? null;

	return (
		<MyBookingFlow
			doctor={doctor}
			slot={slot}
			alternatives={slot ? [] : openSlots.slice(0, 3)}
			patient={{ fullName: profile.fullName, phone: profile.phone, email: profile.email }}
		/>
	);
}

function BadLink() {
	return (
		<div className="mx-auto max-w-xl rounded-xl border border-border bg-card shadow-card">
			<EmptyState
				icon={CalendarX}
				title="This booking link isn't complete"
				description="Pick a doctor and a time again to start your booking."
				action={
					<Button render={<Link href={FIND_DOCTOR_PATH} />} nativeButton={false}>
						Find a doctor
					</Button>
				}
			/>
		</div>
	);
}

function BookingSkeleton() {
	return (
		<div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8" aria-busy="true">
			<div className="flex flex-col gap-5">
				<Skeleton className="h-8 w-full max-w-md" />
				<Skeleton className="h-112 rounded-xl" />
			</div>
			<Skeleton className="hidden h-96 rounded-xl lg:block" />
		</div>
	);
}
