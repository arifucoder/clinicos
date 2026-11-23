import { BookingDone } from "@/components/modules/booking/BookingDone";
import { NewPatientPanel } from "@/components/modules/booking/NewPatientPanel";
import { PatientResults } from "@/components/modules/booking/PatientResults";
import { PaymentStep } from "@/components/modules/booking/PaymentStep";
import { SlotPicker } from "@/components/modules/booking/SlotPicker";
import { DoctorPicker } from "@/components/modules/slot/DoctorPicker";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { addDays, clinicToday, dateRange } from "@/lib/clinicDate";
import { BOOK_PATH, toBookableDays } from "@/lib/deskBooking";
import { AppointmentService } from "@/services/appointment.service";
import { DoctorService } from "@/services/doctor.service";
import { PatientService } from "@/services/patient.service";
import { SlotService } from "@/services/slot.service";
import type { SlotDoctorOption } from "@/types/slot.types";
import { BOOKING_DAYS, bookPageQuerySchema } from "@/zod/appointment.validation";
import { doctorListQuerySchema } from "@/zod/doctor.validation";
import { patientListQuerySchema } from "@/zod/patient.validation";
import { isAxiosError } from "axios";
import { CalendarX, Stethoscope, UserX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { type ReactNode, Suspense } from "react";

export const metadata: Metadata = { title: "Book for patient" };

type SearchParams = PageProps<"/admin/front-desk/book">["searchParams"];

const ACTIVE_DOCTORS_QUERY = doctorListQuerySchema.parse({
	isActive: "true",
	limit: 100,
	sortBy: "user.name",
	sortOrder: "asc",
});

const orNullOn404 = async <T,>(load: () => Promise<{ data: T }>): Promise<T | null> => {
	try {
		return (await load()).data;
	} catch (error) {
		if (isAxiosError(error) && error.response?.status === 404) return null;
		throw error;
	}
};

const loadBookableDays = (doctorId: string, dates: string[], now: Date) =>
	orNullOn404(() =>
		SlotService.getManageSlots(doctorId, { from: addDays(dates[0], -1), to: dates[dates.length - 1] }),
	).then((days) => (days === null ? null : toBookableDays(days, dates, now)));

export default function BookForPatientPage({ searchParams }: PageProps<"/admin/front-desk/book">) {
	return (
		<Suspense fallback={<BookSkeleton />}>
			<BookContent searchParams={searchParams} />
		</Suspense>
	);
}

async function BookContent({ searchParams }: { searchParams: SearchParams }) {
	const query = bookPageQuerySchema.parse(await searchParams);

	await connection(); // এর পরে new Date() নিরাপদ
	const now = new Date();
	const today = clinicToday(now);

	if (query.booked) {
		const appointment = await orNullOn404(() => AppointmentService.getAppointment(query.booked as string));
		return (
			<BookLayout>
				{appointment ? (
					<BookingDone appointment={appointment} />
				) : (
					<NotFound icon={CalendarX} title="Appointment not found" />
				)}
			</BookLayout>
		);
	}

	if (!query.patientId) {
		const patients = query.searchTerm
			? (
					await PatientService.getPatients(
						patientListQuerySchema.parse({
							searchTerm: query.searchTerm,
							limit: 8,
							sortBy: "fullName",
							sortOrder: "asc",
						}),
					)
				).data
			: null;

		return (
			<BookLayout step={1}>
				{query.new ? <NewPatientPanel /> : <PatientResults searchTerm={query.searchTerm} patients={patients} />}
			</BookLayout>
		);
	}

	const dates = dateRange(today, BOOKING_DAYS);

	const [patient, doctorsResponse, bookableDays] = await Promise.all([
		orNullOn404(() => PatientService.getPatient(query.patientId as string)),
		DoctorService.getDoctors(ACTIVE_DOCTORS_QUERY),
		query.doctorId ? loadBookableDays(query.doctorId, dates, now) : Promise.resolve(undefined),
	]);

	if (!patient || !patient.user.isActive) {
		return (
			<BookLayout step={1}>
				<NotFound icon={UserX} title={patient ? "This patient's account is turned off" : "Patient not found"} />
			</BookLayout>
		);
	}

	const doctors: SlotDoctorOption[] = doctorsResponse.data.map((doctor) => ({
		id: doctor.id,
		name: doctor.user.name,
		specialties: doctor.specialties.map((specialty) => specialty.name).join(", "),
	}));
	const selectedDoctor = doctorsResponse.data.find((doctor) => doctor.id === query.doctorId);

	const openDates = (bookableDays ?? []).filter((day) => day.slots.length > 0).map((day) => day.date);
	const date = query.date && openDates.includes(query.date) ? query.date : (openDates[0] ?? today);
	const slots = bookableDays?.find((day) => day.date === date)?.slots ?? [];
	const selectedSlot = slots.find((slot) => slot.id === query.slotId) ?? null;

	return (
		<BookLayout step={selectedSlot ? 3 : 2}>
			<section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-card">
				<div className="min-w-0">
					<p className="text-xs font-medium text-muted-foreground">1. Patient</p>
					<p className="truncate font-medium text-foreground">{patient.fullName}</p>
					<p className="truncate text-sm text-muted-foreground">
						{[patient.phone, patient.user.email].filter(Boolean).join(" · ")}
					</p>
				</div>
				<Button variant="outline" size="sm" render={<Link href={BOOK_PATH} />} nativeButton={false}>
					Change
				</Button>
			</section>

			<section className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-card md:p-5">
				<h2 className="font-heading text-base font-semibold text-foreground">2. Doctor & time</h2>
				<DoctorPicker doctors={doctors} value={query.doctorId} />

				{bookableDays === undefined ? (
					<EmptyState icon={Stethoscope} title="Pick a doctor" description="Then choose a date and an open time." />
				) : bookableDays === null ? (
					<EmptyState icon={UserX} title="Doctor not found" description="Pick another doctor." />
				) : openDates.length === 0 ? (
					<EmptyState
						icon={CalendarX}
						title="No open slots in the next 2 weeks"
						description="Pick another doctor, or open slots from Doctors & slots."
					/>
				) : (
					<SlotPicker
						openDates={openDates}
						firstDate={dates[0]}
						lastDate={dates[dates.length - 1]}
						date={date}
						today={today}
						slots={slots}
						slotId={selectedSlot?.id}
					/>
				)}
			</section>

			{selectedSlot && selectedDoctor && (
				<PaymentStep
					key={selectedSlot.id} // অন্য slot বাছলে form নতুন করে শুরু
					patientId={patient.id}
					patientName={patient.fullName}
					doctorName={selectedDoctor.user.name}
					feeCents={selectedDoctor.consultationFeeCents}
					date={date}
					slot={selectedSlot}
				/>
			)}
		</BookLayout>
	);
}

const STEPS = ["Patient", "Doctor & time", "Payment"];

function BookLayout({ step, children }: { step?: number; children: ReactNode }) {
	return (
		<div className="max-w-4xl space-y-5">
			<PageHeader title="Book for patient" />
			{step && (
				<ol className="flex gap-4 text-sm" aria-label="Booking steps">
					{STEPS.map((label, index) => (
						<li
							key={label}
							aria-current={index + 1 === step ? "step" : undefined}
							className={index + 1 === step ? "font-semibold text-primary" : "text-muted-foreground"}
						>
							{index + 1}. {label}
						</li>
					))}
				</ol>
			)}
			{children}
		</div>
	);
}

function NotFound({ icon, title }: { icon: typeof UserX; title: string }) {
	return (
		<div className="rounded-xl border border-border bg-card">
			<EmptyState
				icon={icon}
				title={title}
				action={
					<Button render={<Link href={BOOK_PATH} />} nativeButton={false}>
						Start over
					</Button>
				}
			/>
		</div>
	);
}

function BookSkeleton() {
	return (
		<div className="max-w-4xl space-y-5">
			<Skeleton className="h-8 w-56" />
			<Skeleton className="h-5 w-72" />
			<Skeleton className="h-20 w-full rounded-xl" />
			<Skeleton className="h-64 w-full rounded-xl" />
		</div>
	);
}
