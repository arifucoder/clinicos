"use client";

import { updateMyPatientProfileAction } from "@/actions/patient.action";
import { FieldShell } from "@/components/shared/form/FieldShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServerFieldErrors } from "@/hooks/useServerFieldErrors";
import { fieldA11y, getClientError } from "@/lib/formField";
import { BLOOD_GROUP_LABEL, GENDER_LABEL } from "@/lib/patientDisplay";
import type { BloodGroup, Gender, MyPatientProfile } from "@/types/patient.types";
import {
	BLOOD_GROUPS,
	GENDERS,
	type MyPatientProfileFormValues,
	myPatientProfileFormSchema,
} from "@/zod/patient.validation";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type TextFieldName = "phone" | "dateOfBirth" | "address" | "emergencyContactName" | "emergencyContactPhone";

// api-র null → form-এর "" (input সবসময় string চায়); জন্মতারিখ ISO → "YYYY-MM-DD"
const toFormValues = (profile: MyPatientProfile): MyPatientProfileFormValues => ({
	phone: profile.phone ?? "",
	dateOfBirth: profile.dateOfBirth?.slice(0, 10) ?? "",
	gender: profile.gender ?? "",
	address: profile.address ?? "",
	bloodGroup: profile.bloodGroup ?? "",
	emergencyContactName: profile.emergencyContactName ?? "",
	emergencyContactPhone: profile.emergencyContactPhone ?? "",
});

const sectionTitle = "font-heading text-sm font-semibold text-foreground";

export function MyProfileForm({ profile, returnTo }: { profile: MyPatientProfile; returnTo?: string }) {
	const router = useRouter();
	const [formError, setFormError] = useState<string | null>(null);
	const { serverErrors, setServerErrors, clearServerError } = useServerFieldErrors();

	const form = useForm({
		defaultValues: toFormValues(profile),
		validators: { onBlur: myPatientProfileFormSchema, onSubmit: myPatientProfileFormSchema },
		onSubmit: async ({ value }) => {
			setFormError(null);
			setServerErrors({});

			const result = await updateMyPatientProfileAction(value);
			if (!result.success) {
				if (result.fieldErrors) setServerErrors(result.fieldErrors);
				else setFormError(result.message);
				return;
			}

			if (returnTo) {
				toast.success("Profile saved — back to your booking");
				router.push(returnTo);
				return;
			}

			toast.success("Profile saved");
			form.reset(value); // সংরক্ষিত মান-ই নতুন default → "Save" আবার বন্ধ
		},
	});

	// একই রকম text input-গুলোর জন্য একটা helper (Select দুটো আলাদা, নিচে)
	const renderTextField = (
		name: TextFieldName,
		label: string,
		options: { type?: "text" | "tel" | "date"; optional?: boolean; hint?: string; autoComplete?: string } = {},
	) => (
		<form.Field name={name}>
			{(field) => {
				const id = `profile-${name}`;
				const error = getClientError(field.state.meta) ?? serverErrors[name];
				return (
					<FieldShell id={id} label={label} optional={options.optional} error={error} hint={options.hint}>
						<Input
							{...fieldA11y(id, error, options.hint)}
							type={options.type ?? "text"}
							autoComplete={options.autoComplete ?? "off"}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => {
								field.handleChange(event.target.value);
								clearServerError(name);
							}}
						/>
					</FieldShell>
				);
			}}
		</form.Field>
	);

	return (
		<form
			noValidate
			className="space-y-8 rounded-xl border border-border bg-card p-5 shadow-card md:p-6"
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
					{renderTextField("dateOfBirth", "Date of birth", { type: "date", autoComplete: "bday" })}

					<form.Field name="gender">
						{(field) => {
							const error = getClientError(field.state.meta) ?? serverErrors.gender;
							return (
								<FieldShell id="profile-gender" label="Gender" error={error}>
									<Select
										value={field.state.value}
										onValueChange={(value) => {
											field.handleChange(value ?? "");
											// Select-এ আসল blur নেই → বাছাই করলেই touched
											field.handleBlur();
											clearServerError("gender");
										}}
									>
										<SelectTrigger {...fieldA11y("profile-gender", error)} className="h-10 w-full">
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

					<form.Field name="bloodGroup">
						{(field) => {
							const error = getClientError(field.state.meta) ?? serverErrors.bloodGroup;
							return (
								<FieldShell id="profile-blood" label="Blood group" optional error={error}>
									<Select
										value={field.state.value}
										onValueChange={(value) => {
											field.handleChange(value ?? "");
											clearServerError("bloodGroup");
										}}
									>
										<SelectTrigger {...fieldA11y("profile-blood", error)} className="h-10 w-full">
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
				</div>
			</fieldset>

			{/* ---------- Contact ---------- */}
			<fieldset className="space-y-4">
				<legend className={sectionTitle}>Contact</legend>
				<div className="grid gap-5 sm:grid-cols-2">
					{renderTextField("phone", "Phone", {
						type: "tel",
						autoComplete: "tel",
						hint: "The front desk calls this number if your appointment changes.",
					})}
					<div className="sm:col-span-2">
						{renderTextField("address", "Address", { optional: true, autoComplete: "street-address" })}
					</div>
				</div>
			</fieldset>

			{/* ---------- Emergency contact ---------- */}
			<fieldset className="space-y-4">
				<legend className={sectionTitle}>Emergency contact</legend>
				<div className="grid gap-5 sm:grid-cols-2">
					{renderTextField("emergencyContactName", "Name", { optional: true })}
					{renderTextField("emergencyContactPhone", "Phone", { type: "tel", optional: true })}
				</div>
			</fieldset>

			<div className="flex flex-wrap justify-end gap-2 border-t border-border pt-5">
				<form.Subscribe selector={(state) => [state.isSubmitting, state.isDefaultValue] as const}>
					{([isSubmitting, isDefaultValue]) => (
						<>
							<Button
								type="button"
								variant="outline"
								disabled={isSubmitting || isDefaultValue}
								onClick={() => {
									form.reset();
									setServerErrors({});
									setFormError(null);
								}}
							>
								Discard changes
							</Button>
							<Button type="submit" disabled={isSubmitting || isDefaultValue} className="min-w-32">
								{isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
								Save changes
							</Button>
						</>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
