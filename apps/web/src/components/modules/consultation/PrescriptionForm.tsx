"use client";

import { completeAppointmentAction, savePrescriptionAction } from "@/actions/appointment.action";
import { FieldShell } from "@/components/shared/form/FieldShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fieldA11y, getClientError } from "@/lib/formField";
import { EMPTY_ITEM, toPrescriptionFormValues } from "@/lib/prescriptionForm";
import type { Appointment } from "@/types/appointment.types";
import { type PrescriptionFormValues, prescriptionFormSchema } from "@/zod/prescription.validation";
import { type AnyFieldApi, useForm } from "@tanstack/react-form";
import { CheckCircle2, Loader2, Plus, Printer, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ComponentProps, useState, useTransition } from "react";
import { toast } from "sonner";

const MAX_ITEMS = 30;

const snapshot = (values: PrescriptionFormValues) => JSON.stringify(values);

interface FieldBaseProps {
	field: AnyFieldApi;
	id: string;
	label: string;
	optional?: boolean;
	hint?: string;
	className?: string;
}

function FormInput({
	field,
	id,
	label,
	optional,
	hint,
	className,
	...props
}: FieldBaseProps & ComponentProps<typeof Input>) {
	const error = getClientError(field.state.meta);
	return (
		<div className={className}>
			<FieldShell id={id} label={label} optional={optional} error={error} hint={hint}>
				<Input
					{...props}
					{...fieldA11y(id, error, hint)}
					value={field.state.value}
					onChange={(event) => field.handleChange(event.target.value)}
					onBlur={field.handleBlur}
				/>
			</FieldShell>
		</div>
	);
}

function FormTextarea({
	field,
	id,
	label,
	optional,
	hint,
	className,
	...props
}: FieldBaseProps & ComponentProps<typeof Textarea>) {
	const error = getClientError(field.state.meta);
	return (
		<div className={className}>
			<FieldShell id={id} label={label} optional={optional} error={error} hint={hint}>
				<Textarea
					{...props}
					{...fieldA11y(id, error, hint)}
					value={field.state.value}
					onChange={(event) => field.handleChange(event.target.value)}
					onBlur={field.handleBlur}
				/>
			</FieldShell>
		</div>
	);
}

interface PrescriptionFormProps {
	appointment: Appointment;
	today: string; // server থেকে "YYYY-MM-DD" → follow-up-এর min; hydration mismatch হয় না
}

export function PrescriptionForm({ appointment, today }: PrescriptionFormProps) {
	const router = useRouter();
	const isCompleted = appointment.status === "COMPLETED";

	const [initialValues] = useState(() => toPrescriptionFormValues(appointment.prescription));
	const [savedSnapshot, setSavedSnapshot] = useState<string | null>(() =>
		appointment.prescription ? snapshot(initialValues) : null,
	);
	const [formError, setFormError] = useState<string | null>(null);
	const [isCompleting, startCompleting] = useTransition();

	const form = useForm({
		defaultValues: initialValues,
		validators: { onBlur: prescriptionFormSchema, onSubmit: prescriptionFormSchema },
		onSubmit: async ({ value }) => {
			setFormError(null);
			const result = await savePrescriptionAction(appointment.id, value);
			if (!result.success) {
				setFormError(result.message);
				toast.error(result.message);
				return;
			}
			setSavedSnapshot(snapshot(value));
			toast.success("Prescription saved");
		},
	});

	const handleComplete = () =>
		startCompleting(async () => {
			const result = await completeAppointmentAction(appointment.id);
			if (!result.success) {
				toast.error(result.message);
				return;
			}
			toast.success(`${appointment.patient.fullName} — consultation completed`);
			router.push("/doctor");
		});

	const sectionTitle = "font-heading text-sm font-semibold text-foreground";

	return (
		<form
			noValidate
			aria-label="Prescription"
			className="space-y-6 rounded-xl border border-border bg-card p-4 shadow-card md:p-6"
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

			<fieldset className="space-y-4">
				<legend className={sectionTitle}>Diagnosis</legend>
				<form.Field name="symptoms">
					{(field) => (
						<FormTextarea
							field={field}
							id="rx-symptoms"
							label="Symptoms"
							optional
							maxLength={1000}
							rows={2}
							placeholder="e.g. Fever for 3 days, headache"
						/>
					)}
				</form.Field>
				<form.Field name="diagnosis">
					{(field) => (
						<FormTextarea
							field={field}
							id="rx-diagnosis"
							label="Diagnosis"
							maxLength={1000}
							rows={2}
							placeholder="e.g. Viral fever"
						/>
					)}
				</form.Field>
			</fieldset>

			<form.Field name="items" mode="array">
				{(itemsField) => (
					<fieldset className="space-y-3">
						<legend className={sectionTitle}>Medicines</legend>

						{itemsField.state.value.length === 0 && (
							<p className="text-sm text-muted-foreground">No medicines added. That&rsquo;s fine if only advice is needed.</p>
						)}

						{itemsField.state.value.map((_, index) => (
							<div
								key={index}
								className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-start"
							>
								<form.Field name={`items[${index}].medicineName`}>
									{(field) => (
										<FormInput
											field={field}
											id={`rx-item-${index}-name`}
											label="Medicine"
											className="sm:col-span-2 lg:col-span-4"
											maxLength={120}
											placeholder="e.g. Napa 500 mg"
										/>
									)}
								</form.Field>
								<form.Field name={`items[${index}].dosage`}>
									{(field) => (
										<FormInput
											field={field}
											id={`rx-item-${index}-dosage`}
											label="Dosage"
											className="lg:col-span-2"
											maxLength={60}
											placeholder="1 tablet"
										/>
									)}
								</form.Field>
								<form.Field name={`items[${index}].frequency`}>
									{(field) => (
										<FormInput
											field={field}
											id={`rx-item-${index}-frequency`}
											label="Frequency"
											className="lg:col-span-2"
											maxLength={60}
											placeholder="1+0+1"
										/>
									)}
								</form.Field>
								<form.Field name={`items[${index}].durationDays`}>
									{(field) => (
										<FormInput
											field={field}
											id={`rx-item-${index}-days`}
											label="Days"
											optional
											className="lg:col-span-2"
											inputMode="numeric"
											maxLength={3}
											placeholder="5"
										/>
									)}
								</form.Field>
								<div className="flex items-end lg:col-span-2 lg:justify-end lg:pt-7">
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="text-destructive"
										onClick={() => itemsField.removeValue(index)}
										aria-label={`Remove medicine ${index + 1}`}
									>
										<Trash2 aria-hidden="true" />
										Remove
									</Button>
								</div>
								<form.Field name={`items[${index}].instructions`}>
									{(field) => (
										<FormInput
											field={field}
											id={`rx-item-${index}-instructions`}
											label="Instructions"
											optional
											className="sm:col-span-2 lg:col-span-12"
											maxLength={200}
											placeholder="After meal"
										/>
									)}
								</form.Field>
							</div>
						))}

						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => itemsField.pushValue({ ...EMPTY_ITEM })}
							disabled={itemsField.state.value.length >= MAX_ITEMS}
						>
							<Plus aria-hidden="true" />
							Add medicine
						</Button>
					</fieldset>
				)}
			</form.Field>

			<fieldset className="grid gap-4 sm:grid-cols-[1fr_220px]">
				<legend className={`${sectionTitle} mb-4`}>Advice</legend>
				<form.Field name="advice">
					{(field) => (
						<FormTextarea
							field={field}
							id="rx-advice"
							label="Advice"
							optional
							maxLength={1000}
							rows={3}
							placeholder="e.g. Drink plenty of water, rest for 3 days"
						/>
					)}
				</form.Field>
				<form.Field name="followUpDate">
					{(field) => <FormInput field={field} id="rx-follow-up" label="Follow-up" optional type="date" min={today} />}
				</form.Field>
			</fieldset>

			<form.Subscribe selector={(state) => [state.values, state.isSubmitting] as const}>
				{([values, isSubmitting]) => {
					const hasUnsaved = snapshot(values) !== savedSnapshot;
					const isBusy = isSubmitting || isCompleting;
					const canComplete = !isCompleted && savedSnapshot !== null && !hasUnsaved;

					const statusText = isCompleted
						? hasUnsaved
							? "Unsaved changes"
							: "Completed — you can still correct the prescription."
						: savedSnapshot === null
							? "Save the prescription to enable Complete."
							: hasUnsaved
								? "Unsaved changes — save before completing."
								: "Saved";

					return (
						<div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-end">
							<p className="text-xs text-muted-foreground sm:mr-auto" aria-live="polite">
								{statusText}
							</p>
							{savedSnapshot !== null && !hasUnsaved ? (
								<Button
									variant="outline"
									render={<Link href={`/doctor/appointments/${appointment.id}/print`} />}
									nativeButton={false}
								>
									<Printer aria-hidden="true" />
									Print
								</Button>
							) : (
								<Button type="button" variant="outline" disabled>
									<Printer aria-hidden="true" />
									Print
								</Button>
							)}
							<Button
								type="submit"
								variant={isCompleted ? "default" : "outline"}
								disabled={isBusy || !hasUnsaved}
								className="min-w-28"
							>
								{isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
								Save
							</Button>
							{!isCompleted && (
								<Button type="button" onClick={handleComplete} disabled={!canComplete || isBusy} className="min-w-32">
									{isCompleting ? (
										<Loader2 className="animate-spin" aria-hidden="true" />
									) : (
										<CheckCircle2 aria-hidden="true" />
									)}
									Complete
								</Button>
							)}
						</div>
					);
				}}
			</form.Subscribe>
		</form>
	);
}
