"use client";

import { openSlotsAction } from "@/actions/slot.action";
import { FieldShell } from "@/components/shared/form/FieldShell";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServerFieldErrors } from "@/hooks/useServerFieldErrors";
import { dateRange, formatDayLabel } from "@/lib/clinicDate";
import { pluralize } from "@/lib/format";
import { fieldA11y, getClientError } from "@/lib/formField";
import {
	MAX_BREAKS,
	MAX_DATES_PER_REQUEST,
	OPEN_MAX_DAYS_AHEAD,
	openSlotsFormSchema,
	SLOT_MINUTES,
	type OpenSlotsFormValues,
} from "@/zod/slot.validation";
import { useForm } from "@tanstack/react-form";
import { cn } from "cn";
import { CalendarPlus, Loader2, Moon, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const FORM_FIELDS = new Set(["dates", "startTime", "endTime", "slotMinutes", "breaks"]);

// satisfies না: dates: [] তাহলে never[] হয়ে যেত
const DEFAULT_VALUES: OpenSlotsFormValues = {
	dates: [],
	startTime: "09:00",
	endTime: "13:00",
	slotMinutes: "15",
	breaks: [],
};

interface OpenSlotsButtonProps {
	doctorId: string | null;
	today: string;
}

export function OpenSlotsButton({ doctorId, today }: OpenSlotsButtonProps) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)} disabled={!doctorId} title={doctorId ? undefined : "Pick a doctor first"}>
				<CalendarPlus aria-hidden="true" /> Open slots
			</Button>

			{doctorId && (
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
						<DialogHeader>
							<DialogTitle>Open slots</DialogTitle>
							<DialogDescription>
								Times are clinic time. If the end is earlier than the start, the shift runs past midnight.
							</DialogDescription>
						</DialogHeader>
						<OpenSlotsForm key={doctorId} doctorId={doctorId} today={today} onDone={() => setOpen(false)} />
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}

interface OpenSlotsFormProps {
	doctorId: string;
	today: string;
	onDone: () => void;
}

function OpenSlotsForm({ doctorId, today, onDone }: OpenSlotsFormProps) {
	const [formError, setFormError] = useState<string | null>(null);
	const { serverErrors, setServerErrors, clearServerError } = useServerFieldErrors();
	const selectableDates = dateRange(today, OPEN_MAX_DAYS_AHEAD);

	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: { onBlur: openSlotsFormSchema },
		onSubmit: async ({ value }) => {
			setFormError(null);
			setServerErrors({});

			const result = await openSlotsAction(doctorId, value);
			if (!result.success) {
				// field-এর error হলে field-এ; 409 overlap / 400 past হলে উপরে message
				const fieldErrors = result.fieldErrors ?? {};
				if (Object.keys(fieldErrors).some((key) => FORM_FIELDS.has(key))) setServerErrors(fieldErrors);
				else setFormError(result.message);
				return;
			}

			const { skippedPast } = result.data;
			toast.success(
				skippedPast > 0 ? `${result.message} · ${pluralize(skippedPast, "past time")} skipped` : result.message,
			);
			onDone();
		},
	});

	return (
		<form
			noValidate
			className="space-y-6"
			onSubmit={(event) => {
				event.preventDefault();
				void form.handleSubmit();
			}}
		>
			{formError && (
				<p
					role="alert"
					className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
				>
					{formError}
				</p>
			)}

			<form.Field name="dates">
				{(field) => {
					const error = getClientError(field.state.meta) ?? serverErrors.dates;
					const picked = field.state.value;
					const atMax = picked.length >= MAX_DATES_PER_REQUEST;

					const toggleDate = (date: string) => {
						field.handleChange(
							picked.includes(date) ? picked.filter((value) => value !== date) : [...picked, date].toSorted(),
						);
						field.handleBlur(); // button-এ blur নেই → touch করে validation চালাই
						clearServerError("dates");
					};

					return (
						<fieldset aria-describedby="open-dates-message">
							<legend className="mb-2 text-[13px] font-medium">Dates</legend>
							<div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
								{selectableDates.map((date) => {
									const isPicked = picked.includes(date);
									return (
										<button
											key={date}
											type="button"
											aria-pressed={isPicked}
											disabled={!isPicked && atMax}
											onClick={() => toggleDate(date)}
											className={cn(
												"rounded-md border px-1 py-1.5 text-xs font-medium tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-40",
												isPicked
													? "border-primary bg-primary text-primary-foreground"
													: "border-border bg-card text-body hover:border-primary/60",
											)}
										>
											{formatDayLabel(date)}
										</button>
									);
								})}
							</div>
							<p
								id="open-dates-message"
								className={cn("mt-2", error ? "text-sm text-destructive" : "text-xs text-muted-foreground")}
							>
								{error ??
									`${picked.length}/${MAX_DATES_PER_REQUEST} selected · up to ${OPEN_MAX_DAYS_AHEAD} days ahead`}
							</p>
						</fieldset>
					);
				}}
			</form.Field>

			<div className="space-y-2">
				<div className="grid gap-5 sm:grid-cols-3">
					<form.Field name="startTime">
						{(field) => {
							const error = getClientError(field.state.meta) ?? serverErrors.startTime;
							return (
								<FieldShell id="open-start" label="Start" error={error}>
									<Input
										{...fieldA11y("open-start", error)}
										type="time"
										step={300}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => {
											field.handleChange(event.target.value);
											clearServerError("startTime");
										}}
									/>
								</FieldShell>
							);
						}}
					</form.Field>

					<form.Field name="endTime">
						{(field) => {
							const error = getClientError(field.state.meta) ?? serverErrors.endTime;
							return (
								<FieldShell id="open-end" label="End" error={error}>
									<Input
										{...fieldA11y("open-end", error)}
										type="time"
										step={300}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => {
											field.handleChange(event.target.value);
											clearServerError("endTime");
										}}
									/>
								</FieldShell>
							);
						}}
					</form.Field>

					<form.Field name="slotMinutes">
						{(field) => {
							const error = getClientError(field.state.meta) ?? serverErrors.slotMinutes;
							return (
								<FieldShell id="open-minutes" label="Slot length" error={error}>
									<Select
										value={field.state.value}
										onValueChange={(value) => {
											if (!value) return;
											field.handleChange(value);
											clearServerError("slotMinutes");
										}}
									>
										<SelectTrigger {...fieldA11y("open-minutes", error)} className="w-full">
											<SelectValue>{(value: string) => `${value} minutes`}</SelectValue>
										</SelectTrigger>
										<SelectContent>
											{SLOT_MINUTES.map((minutes) => (
												<SelectItem key={minutes} value={minutes}>
													{minutes} minutes
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FieldShell>
							);
						}}
					</form.Field>
				</div>

				{/* "HH:mm" string-এ < তুলনা ঠিক কাজ করে (zero-padded) */}
				<form.Subscribe
					selector={(state) => state.values.endTime !== "" && state.values.endTime < state.values.startTime}
				>
					{(overnight) =>
						overnight && (
							<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
								<Moon className="size-3.5" aria-hidden="true" /> Overnight shift — ends the next day.
							</p>
						)
					}
				</form.Subscribe>
			</div>

			<form.Field name="breaks" mode="array">
				{(field) => (
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<p className="text-[13px] font-medium">
								Breaks <span className="font-normal text-muted-foreground">(optional)</span>
							</p>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								disabled={field.state.value.length >= MAX_BREAKS}
								onClick={() => field.pushValue({ startTime: "", endTime: "" })}
							>
								<Plus aria-hidden="true" /> Add break
							</Button>
						</div>

						{field.state.value.map((_, index) => (
							<div key={index} className="flex items-start gap-2">
								<div className="grid flex-1 gap-3 sm:grid-cols-2">
									{(["startTime", "endTime"] as const).map((part) => (
										<form.Field key={part} name={`breaks[${index}].${part}`}>
											{(sub) => {
												const id = `break-${index}-${part}`;
												const error = getClientError(sub.state.meta);
												return (
													<FieldShell
														id={id}
														label={`Break ${index + 1} ${part === "startTime" ? "start" : "end"}`}
														error={error}
													>
														<Input
															{...fieldA11y(id, error)}
															type="time"
															step={300}
															value={sub.state.value}
															onBlur={sub.handleBlur}
															onChange={(event) => {
																sub.handleChange(event.target.value);
																clearServerError("breaks");
															}}
														/>
													</FieldShell>
												);
											}}
										</form.Field>
									))}
								</div>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="mt-7"
									aria-label={`Remove break ${index + 1}`}
									onClick={() => field.removeValue(index)}
								>
									<X aria-hidden="true" />
								</Button>
							</div>
						))}

						{serverErrors.breaks && (
							<p role="alert" className="text-sm text-destructive">
								{serverErrors.breaks}
							</p>
						)}
					</div>
				)}
			</form.Field>

			<DialogFooter>
				<DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button type="submit" disabled={isSubmitting} className="min-w-28">
							{isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
							Open slots
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}
