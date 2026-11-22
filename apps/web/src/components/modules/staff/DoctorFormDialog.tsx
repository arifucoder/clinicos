"use client";

import { createDoctorAction, updateDoctorAction } from "@/actions/doctor.action";
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
import { Textarea } from "@/components/ui/textarea";
import { useServerFieldErrors } from "@/hooks/useServerFieldErrors";
import { fieldA11y, getClientError } from "@/lib/formField";
import type { ActionError } from "@/types/api.types";
import type { SpecialtyRef, StaffDoctor } from "@/types/doctor.types";
import { centsToDollars, doctorFormSchema, MAX_SPECIALTIES, type DoctorFormValues } from "@/zod/doctor.validation";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SpecialtyPicker } from "./SpecialtyPicker";

interface DoctorFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	doctor?: StaffDoctor | null;
	specialties: SpecialtyRef[];
}

export function DoctorFormDialog({ open, onOpenChange, doctor, specialties }: DoctorFormDialogProps) {
	const isEdit = !!doctor;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{/* field অনেক → ছোট screen-এ dialog-এর ভেতরে scroll */}
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>{isEdit ? "Edit doctor" : "New doctor"}</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Email can't be changed. Changing specialties replaces the current list."
							: "We email them a temporary password. They must change it on first login."}
					</DialogDescription>
				</DialogHeader>
				<DoctorForm
					key={doctor?.id ?? "new"}
					doctor={doctor}
					specialties={specialties}
					onDone={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}

interface DoctorFormProps {
	doctor?: StaffDoctor | null;
	specialties: SpecialtyRef[];
	onDone: () => void;
}

function DoctorForm({ doctor, specialties, onDone }: DoctorFormProps) {
	const [formError, setFormError] = useState<string | null>(null);
	const { serverErrors, setServerErrors, clearServerError } = useServerFieldErrors();

	const showError = (result: ActionError) => {
		if (result.fieldErrors) setServerErrors(result.fieldErrors);
		else setFormError(result.message);
	};

	// বন্ধ হয়ে যাওয়া specialty তালিকায় নেই; রেখে দিলে save-এ api 400 দিত
	const activeIds = new Set(specialties.map((specialty) => specialty.id));

	const form = useForm({
		defaultValues: {
			name: doctor?.user.name ?? "",
			email: doctor?.user.email ?? "",
			phone: doctor?.user.phone ?? "",
			specialtyIds: doctor?.specialties.map((specialty) => specialty.id).filter((id) => activeIds.has(id)) ?? [],
			licenseNumber: doctor?.licenseNumber ?? "",
			fee: doctor ? centsToDollars(doctor.consultationFeeCents) : "",
			roomNumber: doctor?.roomNumber ?? "",
			bio: doctor?.bio ?? "",
		} satisfies DoctorFormValues,
		validators: { onBlur: doctorFormSchema },
		onSubmit: async ({ value }) => {
			setFormError(null);
			setServerErrors({});

			if (doctor) {
				const result = await updateDoctorAction(doctor.id, value);
				if (!result.success) return showError(result);
				toast.success(result.message);
			} else {
				const result = await createDoctorAction(value);
				if (!result.success) return showError(result);
				if (result.data.emailSent) toast.success(result.message);
				else toast.warning(result.message);
			}
			onDone();
		},
	});

	return (
		<form
			noValidate
			className="space-y-5"
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

			<div className="grid gap-5 sm:grid-cols-2">
				<form.Field name="name">
					{(field) => {
						const error = getClientError(field.state.meta) ?? serverErrors.name;
						return (
							<FieldShell id="doctor-name" label="Full name" error={error}>
								<Input
									{...fieldA11y("doctor-name", error)}
									autoFocus
									autoComplete="off"
									placeholder="Dr. Ayesha Rahman"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => {
										field.handleChange(event.target.value);
										clearServerError("name");
									}}
								/>
							</FieldShell>
						);
					}}
				</form.Field>

				<form.Field name="email">
					{(field) => {
						const error = getClientError(field.state.meta) ?? serverErrors.email;
						return (
							<FieldShell id="doctor-email" label="Email" error={error}>
								<Input
									{...fieldA11y("doctor-email", error)}
									type="email"
									autoComplete="off"
									readOnly={!!doctor}
									className={doctor ? "bg-muted text-muted-foreground" : undefined}
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
							<FieldShell id="doctor-phone" label="Phone" optional error={error}>
								<Input
									{...fieldA11y("doctor-phone", error)}
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

				<form.Field name="licenseNumber">
					{(field) => {
						const error = getClientError(field.state.meta) ?? serverErrors.licenseNumber;
						return (
							<FieldShell id="doctor-license" label="License number" error={error}>
								<Input
									{...fieldA11y("doctor-license", error)}
									autoComplete="off"
									placeholder="BMDC-A-12345"
									className="uppercase"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => {
										field.handleChange(event.target.value);
										clearServerError("licenseNumber");
									}}
								/>
							</FieldShell>
						);
					}}
				</form.Field>

				<form.Field name="fee">
					{(field) => {
						const error = getClientError(field.state.meta) ?? serverErrors.fee;
						return (
							<FieldShell id="doctor-fee" label="Consultation fee (USD)" error={error}>
								<div className="relative">
									<span
										aria-hidden="true"
										className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground"
									>
										$
									</span>
									<Input
										{...fieldA11y("doctor-fee", error)}
										inputMode="decimal"
										autoComplete="off"
										placeholder="25.00"
										className="pl-7 tabular-nums"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => {
											field.handleChange(event.target.value);
											clearServerError("fee");
										}}
									/>
								</div>
							</FieldShell>
						);
					}}
				</form.Field>

				<form.Field name="roomNumber">
					{(field) => {
						const error = getClientError(field.state.meta) ?? serverErrors.roomNumber;
						return (
							<FieldShell id="doctor-room" label="Room" optional error={error}>
								<Input
									{...fieldA11y("doctor-room", error)}
									autoComplete="off"
									placeholder="2B"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => {
										field.handleChange(event.target.value);
										clearServerError("roomNumber");
									}}
								/>
							</FieldShell>
						);
					}}
				</form.Field>
			</div>

			<form.Field name="specialtyIds">
				{(field) => (
					<SpecialtyPicker
						id="doctor-specialties"
						options={specialties}
						value={field.state.value}
						max={MAX_SPECIALTIES}
						error={getClientError(field.state.meta) ?? serverErrors.specialtyIds}
						onBlur={field.handleBlur}
						onChange={(next) => {
							field.handleChange(next);
							clearServerError("specialtyIds");
						}}
					/>
				)}
			</form.Field>

			<form.Field name="bio">
				{(field) => {
					const error = getClientError(field.state.meta) ?? serverErrors.bio;
					const hint = `${field.state.value.length}/1000`;
					return (
						<FieldShell id="doctor-bio" label="Bio" optional error={error} hint={hint}>
							<Textarea
								{...fieldA11y("doctor-bio", error, hint)}
								rows={3}
								placeholder="Shown on the public doctor profile"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => {
									field.handleChange(event.target.value);
									clearServerError("bio");
								}}
							/>
						</FieldShell>
					);
				}}
			</form.Field>

			<DialogFooter>
				<DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button type="submit" disabled={isSubmitting} className="min-w-28">
							{isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
							{doctor ? "Save changes" : "Create doctor"}
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}
