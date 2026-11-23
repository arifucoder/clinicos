"use client";

import { bookMyAppointmentAction, findAlternativeSlotsAction } from "@/actions/appointment.action";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FIND_DOCTOR_PATH } from "@/lib/findDoctor";
import { formatCents } from "@/lib/format";
import {
	bookingPageHref,
	describeAlternative,
	formatSlotLabel,
	MIN_ONLINE_AMOUNT_CENTS,
	MY_APPOINTMENTS_PATH,
	ONLINE_HOLD_MINUTES,
	profileHrefFor,
	REASON_CHIPS,
} from "@/lib/myBooking";
import { cn } from "@/lib/utils";
import type { BookingSlot, MyBookedAppointment } from "@/types/appointment.types";
import type { PublicDoctor } from "@/types/doctor.types";
import { REASON_MAX } from "@/zod/appointment.validation";
import { ArrowRight, CircleAlert, CreditCard, Info, Loader2, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BookingConfirmed } from "./BookingConfirmed";
import { BookingSteps } from "./BookingSteps";
import { BookingSummary } from "./BookingSummary";

type Step = "details" | "payment" | "taken" | "done";
type PaymentMode = "AT_DESK" | "ONLINE";

interface MyBookingFlowProps {
	doctor: PublicDoctor;
	slot: BookingSlot | null; // null = link-এর slot আর খালি নেই
	alternatives: BookingSlot[];
	patient: { fullName: string; phone: string | null; email: string };
}

const cardClass = "flex flex-col gap-5 rounded-xl border border-border bg-card p-5 shadow-card md:p-7";
const headingClass = "font-heading text-2xl font-bold tracking-tight text-foreground md:text-[26px]";

export function MyBookingFlow({ doctor, slot: initialSlot, alternatives: initialAlternatives, patient }: MyBookingFlowProps) {
	const router = useRouter();
	const [step, setStep] = useState<Step>(initialSlot ? "details" : "taken");
	const [slot, setSlot] = useState(initialSlot);
	const [takenSlot, setTakenSlot] = useState<BookingSlot | null>(null);
	const [alternatives, setAlternatives] = useState(initialAlternatives);
	const [alternativeId, setAlternativeId] = useState(initialAlternatives[0]?.id ?? null);
	const [reason, setReason] = useState("");
	const [paymentMode, setPaymentMode] = useState<PaymentMode>("AT_DESK");
	const [agreed, setAgreed] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [booked, setBooked] = useState<MyBookedAppointment | null>(null);
	const [isPending, startTransition] = useTransition();

	const fee = formatCents(doctor.consultationFeeCents);
	const canPayOnline = doctor.consultationFeeCents >= MIN_ONLINE_AMOUNT_CENTS;
	const returnTo = slot ? bookingPageHref(doctor.id, slot.id) : `${FIND_DOCTOR_PATH}/${doctor.id}`;

	const goTo = (next: Step) => {
		setError(null);
		setStep(next);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const book = (target: BookingSlot) => {
		setError(null);
		startTransition(async () => {
			const result = await bookMyAppointmentAction({
				slotId: target.id,
				paymentMode,
				reason: reason.trim() || undefined,
			});

			if (!result.success) {
				if (result.code === "SLOT_TAKEN") {
					// অন্য কেউ আগে নিয়েছে: details রাখা থাকে, শুধু নতুন সময় বাছতে বলি
					const next = await findAlternativeSlotsAction(doctor.id, target.startAt);
					const options = next.success ? next.data.filter((option) => option.id !== target.id) : [];
					setTakenSlot(target);
					setSlot(null);
					setAlternatives(options);
					setAlternativeId(options[0]?.id ?? null);
					goTo("taken");
					return;
				}
				if (result.code === "PROFILE_INCOMPLETE") {
					router.push(profileHrefFor(bookingPageHref(doctor.id, target.id)));
					return;
				}
				setError(result.message);
				return;
			}

			// online: Stripe-এর page-এ যাই; ফেরত আসে /portal/appointments?payment=… (api-র success_url)
			if (result.data.checkoutUrl) {
				window.location.assign(result.data.checkoutUrl);
				return;
			}

			setBooked(result.data.appointment);
			// URL-এ পুরনো slotId থেকে গেলে refresh করলে "That time was just taken" দেখাত (নিজেই নিয়েছে!)।
			// তাই address bar-এ My visits বসাই, page না বদলে: refresh করলে সেখানে নতুন booking-টা দেখবে
			window.history.replaceState(null, "", MY_APPOINTMENTS_PATH);
			goTo("done");
		});
	};

	if (step === "done" && booked) return <BookingConfirmed appointment={booked} doctor={doctor} />;

	const chosenAlternative = alternatives.find((option) => option.id === alternativeId);

	return (
		<div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
			<div className="flex min-w-0 flex-col gap-5">
				{step !== "taken" && <BookingSteps current={step === "payment" ? "payment" : "details"} />}

				{/* mobile: summary উপরে (desktop-এ ডানে) */}
				<div className="lg:hidden">
					<BookingSummary doctor={doctor} slot={slot ?? takenSlot} taken={step === "taken" && Boolean(takenSlot)} />
				</div>

				{error && (
					<p role="alert" className="flex items-start gap-2 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger-foreground">
						<CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
						{error}
					</p>
				)}

				{step === "details" && (
					<section className={cardClass} aria-labelledby="details-heading">
						<div className="flex flex-col gap-1.5">
							<h1 id="details-heading" className={headingClass}>
								Visit details
							</h1>
							<p className="text-[15px] text-body">A few words help {doctor.name} prepare. You can skip this.</p>
						</div>

						<div className="flex flex-col gap-2.5">
							<Label htmlFor="booking-reason" className="text-[13px]">
								Reason for visit <span className="font-normal text-muted-foreground">(optional)</span>
							</Label>
							<div role="group" aria-label="Common reasons" className="flex flex-wrap gap-2">
								{REASON_CHIPS.map((chip) => {
									const active = reason.trim() === chip;
									return (
										<button
											key={chip}
											type="button"
											aria-pressed={active}
											onClick={() => setReason(active ? "" : chip)}
											className={cn(
												"h-8 rounded-full border px-3.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
												active
													? "border-primary bg-primary-soft text-primary"
													: "border-border bg-card text-body hover:border-primary/50",
											)}
										>
											{chip}
										</button>
									);
								})}
							</div>
							<Textarea
								id="booking-reason"
								rows={3}
								maxLength={REASON_MAX}
								value={reason}
								onChange={(event) => setReason(event.target.value)}
								placeholder="e.g. Fever and sore throat for 3 days"
								aria-describedby="booking-reason-hint"
							/>
							<span id="booking-reason-hint" className="text-xs text-muted-foreground tabular-nums">
								Only your doctor sees this · {reason.length} / {REASON_MAX}
							</span>
						</div>

						<div className="flex flex-col gap-2 rounded-[10px] border border-primary bg-primary-soft/40 p-4">
							<b className="text-sm font-semibold text-foreground">Booking for {patient.fullName}</b>
							<span className="text-[13px] text-body">
								{[patient.phone, patient.email].filter(Boolean).join(" · ")}
							</span>
							<Link href={profileHrefFor(returnTo)} className="w-fit text-[13px] font-semibold text-primary hover:underline">
								Details wrong? Edit your profile
							</Link>
						</div>

						<p className="flex items-start gap-2 rounded-lg bg-background px-4 py-3 text-[13px] text-body">
							<Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
							<span>
								<b className="font-semibold text-foreground">Free cancellation up to 2 hours before</b> your visit, from
								your portal.
							</span>
						</p>

						<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
							<Button
								variant="outline"
								size="lg"
								className="h-11"
								render={<Link href={`${FIND_DOCTOR_PATH}/${doctor.id}`} />}
								nativeButton={false}
							>
								Back
							</Button>
							<Button size="lg" className="h-11 font-semibold" onClick={() => goTo("payment")}>
								Continue to payment
								<ArrowRight />
							</Button>
						</div>
					</section>
				)}

				{step === "payment" && slot && (
					<section className={cardClass} aria-labelledby="payment-heading">
						<div className="flex flex-col gap-1.5">
							<h1 id="payment-heading" className={headingClass}>
								How would you like to pay?
							</h1>
							<p className="text-[15px] text-body">
								Visit fee <b className="font-semibold text-foreground">{fee}</b>.
							</p>
						</div>

						<fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
							<legend className="sr-only">Payment method</legend>
							<PaymentOption
								checked={paymentMode === "AT_DESK"}
								onSelect={() => setPaymentMode("AT_DESK")}
								icon={<Store className="size-5" aria-hidden="true" />}
								title="Pay at the clinic"
								badge="Default"
								description={`Pay ${fee} at reception when you arrive — cash, card or mobile banking.`}
							/>
							{canPayOnline && (
								<PaymentOption
									checked={paymentMode === "ONLINE"}
									onSelect={() => setPaymentMode("ONLINE")}
									icon={<CreditCard className="size-5" aria-hidden="true" />}
									title="Pay online now"
									description={`Card payment on Stripe's secure page. We hold this time for ${ONLINE_HOLD_MINUTES} minutes while you pay.`}
								/>
							)}
						</fieldset>

						<label className="flex cursor-pointer items-start gap-3 text-sm text-body">
							<input
								type="checkbox"
								className="mt-0.5 size-4 shrink-0 accent-primary"
								checked={agreed}
								onChange={(event) => setAgreed(event.target.checked)}
							/>
							I understand the visit is in person, and cancellation is free up to 2 hours before.
						</label>

						<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
							<Button variant="outline" size="lg" className="h-11" disabled={isPending} onClick={() => goTo("details")}>
								Back
							</Button>
							<Button
								size="lg"
								className="h-11 font-semibold"
								disabled={!agreed || isPending}
								onClick={() => book(slot)}
							>
								{isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
								{paymentMode === "ONLINE" ? `Confirm & pay ${fee}` : "Confirm booking"}
							</Button>
						</div>
					</section>
				)}

				{step === "taken" && (
					<section className={cardClass} aria-labelledby="taken-heading">
						<div role="alert" className="flex items-start gap-3 rounded-[10px] bg-danger-soft px-4 py-3.5">
							<CircleAlert className="mt-0.5 size-5 shrink-0 text-danger-foreground" aria-hidden="true" />
							<div className="flex flex-col gap-1">
								<b id="taken-heading" className="text-[15px] font-semibold text-foreground">
									That time was just taken — pick another slot
								</b>
								<span className="text-sm text-body">
									{takenSlot
										? `Someone booked ${formatSlotLabel(takenSlot.startAt)} a moment ago.`
										: "The time in your link isn't open any more."}{" "}
									Your details are saved and you haven&apos;t been charged.
								</span>
							</div>
						</div>

						{alternatives.length > 0 ? (
							<fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
								<legend className="float-left mb-2.5 w-full p-0 text-sm font-semibold text-foreground">
									Nearest times with {doctor.name}
								</legend>
								{alternatives.map((option, index) => (
									<label
										key={option.id}
										className={cn(
											"clear-both flex cursor-pointer items-center gap-3 rounded-[10px] border px-4 py-3",
											option.id === alternativeId ? "border-primary bg-primary-soft/40" : "border-border",
										)}
									>
										<input
											type="radio"
											name="alternative"
											className="size-4 accent-primary"
											checked={option.id === alternativeId}
											onChange={() => setAlternativeId(option.id)}
										/>
										<span className="flex flex-1 flex-col">
											<b className="text-sm font-semibold text-foreground tabular-nums">{formatSlotLabel(option.startAt)}</b>
											<span className="text-xs text-muted-foreground">
												{describeAlternative(option.startAt, takenSlot?.startAt)}
											</span>
										</span>
										{index === 0 && (
											<span className="rounded-full bg-success-soft px-2 text-[11px] font-semibold text-success-foreground">
												{takenSlot ? "Closest" : "Soonest"}
											</span>
										)}
									</label>
								))}
							</fieldset>
						) : (
							<p className="text-sm text-body">{doctor.name} has no other open times in the next two weeks.</p>
						)}

						<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
							<Button
								variant="outline"
								size="lg"
								className="h-11"
								render={<Link href={`${FIND_DOCTOR_PATH}/${doctor.id}`} />}
								nativeButton={false}
							>
								See all times
							</Button>
							{chosenAlternative && (
								<Button
									size="lg"
									className="h-11 font-semibold"
									disabled={isPending}
									onClick={() => {
										setSlot(chosenAlternative);
										setTakenSlot(null);
										// URL-এ নতুন slot, যাতে refresh/login-এ এটাই থাকে
										router.replace(bookingPageHref(doctor.id, chosenAlternative.id), { scroll: false });
										goTo("details");
									}}
								>
									Use {formatSlotLabel(chosenAlternative.startAt).split(" · ")[1]} instead
									<ArrowRight />
								</Button>
							)}
						</div>
					</section>
				)}
			</div>

			<div className="hidden lg:block">
				<BookingSummary doctor={doctor} slot={slot ?? takenSlot} taken={step === "taken" && Boolean(takenSlot)} />
			</div>
		</div>
	);
}

interface PaymentOptionProps {
	checked: boolean;
	onSelect: () => void;
	icon: React.ReactNode;
	title: string;
	badge?: string;
	description: string;
}

function PaymentOption({ checked, onSelect, icon, title, badge, description }: PaymentOptionProps) {
	return (
		<label
			className={cn(
				"flex cursor-pointer items-start gap-3.5 rounded-[10px] border p-4 transition-colors",
				checked ? "border-primary bg-primary-soft/40" : "border-border hover:border-primary/50",
			)}
		>
			<input type="radio" name="payment-mode" className="mt-1 size-4 shrink-0 accent-primary" checked={checked} onChange={onSelect} />
			<span className="mt-0.5 text-muted-foreground">{icon}</span>
			<span className="flex flex-col gap-1">
				<span className="flex items-center gap-2">
					<b className="text-[15px] font-semibold text-foreground">{title}</b>
					{badge && (
						<span className="rounded-full bg-muted px-2 text-[11px] font-semibold text-body">{badge}</span>
					)}
				</span>
				<span className="text-[13px] text-body">{description}</span>
			</span>
		</label>
	);
}
