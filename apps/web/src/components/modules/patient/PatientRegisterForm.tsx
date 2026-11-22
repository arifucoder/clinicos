"use client";

import { createPatientAction } from "@/actions/patient.action";
import { TemporaryPassword } from "@/components/shared/TemporaryPassword";
import { FieldShell } from "@/components/shared/form/FieldShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useServerFieldErrors } from "@/hooks/useServerFieldErrors";
import { fieldA11y, getClientError } from "@/lib/formField";
import { BLOOD_GROUP_LABEL, GENDER_LABEL } from "@/lib/patientDisplay";
import type { BloodGroup, Gender, RegisteredPatient } from "@/types/patient.types";
import { BLOOD_GROUPS, GENDERS, type PatientFormValues, patientFormSchema } from "@/zod/patient.validation";
import { useForm } from "@tanstack/react-form";
import { ArrowRight, CircleCheck, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface PatientRegisterFormProps {
	/** দিলে card-এ "Continue booking" দেখায় (Book for patient page); না দিলে আগের মতো */
	onContinue?: (result: RegisteredPatient) => void;
	/** Cancel button কোথায় নেবে */
	cancelHref?: string;
}

export function PatientRegisterForm({ onContinue, cancelHref = "/admin/patients" }: PatientRegisterFormProps) {
	const [registered, setRegistered] = useState<RegisteredPatient | null>(null);

	// card দেখালে form unmount হয় → "Register another"-এ নতুন, খালি form আসে
	if (registered) {
		return (
			<RegisteredCard
				result={registered}
				onRegisterAnother={() => setRegistered(null)}
				onContinue={onContinue ? () => onContinue(registered) : undefined}
			/>
		);
	}
	return <RegisterForm onRegistered={setRegistered} cancelHref={cancelHref} />;
}

const EMPTY_VALUES = {
	fullName: "",
	email: "",
	phone: "",
	dateOfBirth: "",
	gender: "",
	address: "",
	bloodGroup: "",
	allergies: "",
	emergencyContactName: "",
	emergencyContactPhone: "",
} satisfies PatientFormValues;

interface RegisterFormProps {
	onRegistered: (result: RegisteredPatient) => void;
	cancelHref: string;
}

function RegisterForm({ onRegistered, cancelHref }: RegisterFormProps) {
	const [formError, setFormError] = useState<string | null>(null);
	const { serverErrors, setServerErrors, clearServerError } = useServerFieldErrors();

	const form = useForm({
		defaultValues: EMPTY_VALUES as PatientFormValues,
		validators: { onBlur: patientFormSchema, onSubmit: patientFormSchema },
		onSubmit: async ({ value }) => {
			setFormError(null);
			setServerErrors({});

			const result = await createPatientAction(value);
			if (!result.success) {
				if (result.fieldErrors) setServerErrors(result.fieldErrors);
				else setFormError(result.message);
				return;
			}
			onRegistered(result.data);
		},
	});

	const sectionTitle = "font-heading text-sm font-semibold text-foreground";

	return (
		<form
			noValidate
			className="max-w-3xl space-y-8 rounded-xl border border-border bg-card p-5 shadow-card md:p-6"
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

			{/* ---------- Personal ---------- */}
			<fieldset className="space-y-4">
				<legend className={sectionTitle}>Personal details</legend>
				<div className="grid gap-5 sm:grid-cols-2">
					<form.Field name="fullName">
						{(field) => {
							const error = getClientError(field.state.meta) ?? serverErrors.fullName;
							return (
								<FieldShell id="patient-name" label="Full name" error={error}>
									<Input
										{...fieldA11y("patient-name", error)}
										autoFocus
										autoComplete="off"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => {
											field.handleChange(event.target.value);
											clearServerError("fullName");
										}}
									/>
								</FieldShell>
							);
						}}
					</form.Field>

					<form.Field name="dateOfBirth">
						{(field) => {
							const error = getClientError(field.state.meta) ?? serverErrors.dateOfBirth;
							return (
								<FieldShell id="patient-dob" label="Date of birth" error={error}>
									<Input
										{...fieldA11y("patient-dob", error)}
										type="date"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => {
											field.handleChange(event.target.value);
											clearServerError("dateOfBirth");
										}}
									/>
								</FieldShell>
							);
						}}
					</form.Field>

					<form.Field name="gender">
						{(field) => {
							const error = getClientError(field.state.meta) ?? serverErrors.gender;
							return (
								<FieldShell id="patient-gender" label="Gender" error={error}>
									<Select
										value={field.state.value}
										onValueChange={(value) => {
											field.handleChange(value ?? "");
											// Select-এ আসল blur নেই → বাছাই করলেই touched ধরি, যাতে error মুছে যায়
											field.handleBlur();
											clearServerError("gender");
										}}
									>
										<SelectTrigger {...fieldA11y("patient-gender", error)} className="h-10 w-full">
											<SelectValue>
												{(value: Gender | "") =>
													value ? GENDER_LABEL[value] : <span className="text-muted-foreground">Select gender</span>
												}
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											{GENDERS.map((gender) => (
												<SelectItem key={gender} value={gender}>
													{GENDER_LABEL[gender]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FieldShell>
							);
						}}
					</form.Field>
				</div>
			</fieldset>

			{/* ---------- Contact ---------- */}
			<fieldset className="space-y-4">
				<legend className={sectionTitle}>Contact</legend>
				<div className="grid gap-5 sm:grid-cols-2">
					<form.Field name="email">
						{(field) => {
							const error = getClientError(field.state.meta) ?? serverErrors.email;
							return (
								<FieldShell
									id="patient-email"
									label="Email"
									error={error}
									hint="Login details are sent here. One email = one patient."
								>
									<Input
										{...fieldA11y("patient-email", error, "hint")}
										type="email"
										autoComplete="off"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => {
											field.handleChange(event.target.value);
											clearServerError("email");
										}}
									/>
								</FieldShell>
							);
						}}
					</form.Field>

					<form.Field name="phone">
						{(field) => {
							const error = getClientError(field.state.meta) ?? serverErrors.phone;
							return (
								<FieldShell id="patient-phone" label="Phone" error={error}>
									<Input
										{...fieldA11y("patient-phone", error)}
										type="tel"
										autoComplete="off"
										placeholder="+8801XXXXXXXXX"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => {
											field.handleChange(event.target.value);
											clearServerError("phone");
										}}
									/>
								</FieldShell>
							);
						}}
					</form.Field>

					<div className="sm:col-span-2">
						<form.Field name="address">
							{(field) => {
								const error = getClientError(field.state.meta) ?? serverErrors.address;
								return (
									<FieldShell id="patient-address" label="Address" optional error={error}>
										<Input
											{...fieldA11y("patient-address", error)}
											autoComplete="off"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) => {
												field.handleChange(event.target.value);
												clearServerError("address");
											}}
										/>
									</FieldShell>
								);
							}}
						</form.Field>
					</div>
				</div>
			</fieldset>

			{/* ---------- Medical ---------- */}
			<fieldset className="space-y-4">
				<legend className={sectionTitle}>Medical</legend>
				<div className="grid gap-5 sm:grid-cols-2">
					<form.Field name="bloodGroup">
						{(field) => {
							const error = getClientError(field.state.meta) ?? serverErrors.bloodGroup;
							return (
								<FieldShell id="patient-blood" label="Blood group" optional error={error}>
									<Select
										value={field.state.value}
										onValueChange={(value) => {
											field.handleChange(value ?? "");
											clearServerError("bloodGroup");
										}}
									>
										<SelectTrigger {...fieldA11y("patient-blood", error)} className="h-10 w-full">
											<SelectValue>
												{(value: BloodGroup | "") => (value ? BLOOD_GROUP_LABEL[value] : "Not known")}
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="">Not known</SelectItem>
											{BLOOD_GROUPS.map((group) => (
												<SelectItem key={group} value={group}>
													{BLOOD_GROUP_LABEL[group]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FieldShell>
							);
						}}
					</form.Field>

					<div className="sm:col-span-2">
						<form.Field name="allergies">
							{(field) => {
								const error = getClientError(field.state.meta) ?? serverErrors.allergies;
								return (
									<FieldShell
										id="patient-allergies"
										label="Allergies"
										optional
										error={error}
										hint="Doctors see this in red on every visit."
									>
										<Textarea
											{...fieldA11y("patient-allergies", error, "hint")}
											rows={2}
											placeholder="e.g. Penicillin, peanuts"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) => {
												field.handleChange(event.target.value);
												clearServerError("allergies");
											}}
										/>
									</FieldShell>
								);
							}}
						</form.Field>
					</div>
				</div>
			</fieldset>

			{/* ---------- Emergency contact ---------- */}
			<fieldset className="space-y-4">
				<legend className={sectionTitle}>Emergency contact</legend>
				<div className="grid gap-5 sm:grid-cols-2">
					<form.Field name="emergencyContactName">
						{(field) => {
							const error = getClientError(field.state.meta) ?? serverErrors.emergencyContactName;
							return (
								<FieldShell id="patient-ec-name" label="Name" optional error={error}>
									<Input
										{...fieldA11y("patient-ec-name", error)}
										autoComplete="off"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => {
											field.handleChange(event.target.value);
											clearServerError("emergencyContactName");
										}}
									/>
								</FieldShell>
							);
						}}
					</form.Field>

					<form.Field name="emergencyContactPhone">
						{(field) => {
							const error = getClientError(field.state.meta) ?? serverErrors.emergencyContactPhone;
							return (
								<FieldShell id="patient-ec-phone" label="Phone" optional error={error}>
									<Input
										{...fieldA11y("patient-ec-phone", error)}
										type="tel"
										autoComplete="off"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => {
											field.handleChange(event.target.value);
											clearServerError("emergencyContactPhone");
										}}
									/>
								</FieldShell>
							);
						}}
					</form.Field>
				</div>
			</fieldset>

			<div className="flex flex-wrap justify-end gap-2 border-t border-border pt-5">
				<Button type="button" variant="outline" render={<Link href={cancelHref} />} nativeButton={false}>
					Cancel
				</Button>
				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button type="submit" disabled={isSubmitting} className="min-w-36">
							{isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
							Register patient
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}

interface RegisteredCardProps {
	result: RegisteredPatient;
	onRegisterAnother: () => void;
	/** থাকলে booking flow: শুধু "Continue booking" দেখাই */
	onContinue?: () => void;
}

function RegisteredCard({ result, onRegisterAnother, onContinue }: RegisteredCardProps) {
	const headingRef = useRef<HTMLHeadingElement>(null);

	// screen reader আর keyboard user-কে নতুন content-এ নিয়ে যাই
	useEffect(() => headingRef.current?.focus(), []);

	return (
		<section className="max-w-2xl space-y-5 rounded-xl border border-border bg-card p-5 shadow-card md:p-6">
			<div className="flex items-start gap-3">
				<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
					<CircleCheck className="size-5" aria-hidden="true" />
				</span>
				<div className="min-w-0">
					<h2
						ref={headingRef}
						tabIndex={-1}
						className="font-heading text-lg font-semibold text-foreground outline-none"
					>
						{result.fullName} is registered
					</h2>
					<p className="truncate text-sm text-muted-foreground">{result.email}</p>
				</div>
			</div>

			<div className="space-y-2">
				<p className="text-[13px] font-medium text-foreground">Temporary password</p>
				<TemporaryPassword password={result.temporaryPassword} />
				<p className="text-xs text-muted-foreground">
					Shown only once. The patient must change it the first time they sign in.
				</p>
			</div>

			{!result.emailSent && (
				<p
					role="alert"
					className="rounded-md border border-warning/30 bg-warning-soft px-3 py-2 text-sm text-warning-foreground"
				>
					The welcome email could not be sent. Give this password to the patient now.
				</p>
			)}

			<div className="flex flex-wrap gap-2 border-t border-border pt-5">
				{onContinue ? (
					<Button onClick={onContinue}>
						Continue booking
						<ArrowRight aria-hidden="true" />
					</Button>
				) : (
					<>
						<Button onClick={onRegisterAnother}>
							<UserPlus aria-hidden="true" />
							Register another
						</Button>
						<Button variant="outline" render={<Link href="/admin/patients" />} nativeButton={false}>
							Back to patients
						</Button>
					</>
				)}
			</div>
		</section>
	);
}
