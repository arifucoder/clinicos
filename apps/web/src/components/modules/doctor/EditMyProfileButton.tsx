"use client";

import { updateMyProfileAction } from "@/actions/doctor.action";
import { MyPhotoControl } from "@/components/modules/doctor/MyPhotoControl";
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
import { type MyProfileFormValues, myProfileFormSchema } from "@/zod/doctor.validation";
import { useForm } from "@tanstack/react-form";
import { Loader2, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const BIO_MAX = 1000;

interface EditMyProfileButtonProps {
	defaults: MyProfileFormValues;
	photoUrl: string | null;
}

export function EditMyProfileButton({ defaults, photoUrl }: EditMyProfileButtonProps) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button variant="outline" onClick={() => setOpen(true)}>
				<Pencil aria-hidden="true" />
				Edit profile
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Edit profile</DialogTitle>
						<DialogDescription>License, fee, specialties and room are managed by the clinic.</DialogDescription>
					</DialogHeader>

					<div className="flex items-center gap-4 rounded-lg border border-border p-3">
						<MyPhotoControl name={defaults.name} photoUrl={photoUrl} />
						<p className="text-xs text-muted-foreground">
							JPEG, PNG or WebP, up to 2 MB. Your photo is saved as soon as you pick it.
						</p>
					</div>

					{open && <MyProfileForm defaults={defaults} onDone={() => setOpen(false)} />}
				</DialogContent>
			</Dialog>
		</>
	);
}

function MyProfileForm({ defaults, onDone }: { defaults: MyProfileFormValues; onDone: () => void }) {
	const [formError, setFormError] = useState<string | null>(null);
	const { serverErrors, setServerErrors, clearServerError } = useServerFieldErrors();

	const form = useForm({
		defaultValues: defaults,
		validators: { onBlur: myProfileFormSchema },
		onSubmit: async ({ value }) => {
			setFormError(null);
			setServerErrors({});

			const result = await updateMyProfileAction(value);
			if (!result.success) {
				if (result.fieldErrors) setServerErrors(result.fieldErrors);
				else setFormError(result.message);
				return;
			}
			toast.success(result.message);
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

			<form.Field name="name">
				{(field) => {
					const error = getClientError(field.state.meta) ?? serverErrors.name;
					return (
						<FieldShell id="me-name" label="Full name" error={error} hint="Printed on your prescriptions.">
							<Input
								{...fieldA11y("me-name", error, "hint")}
								autoComplete="name"
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

			<form.Field name="phone">
				{(field) => {
					const error = getClientError(field.state.meta) ?? serverErrors.phone;
					return (
						<FieldShell id="me-phone" label="Phone" optional error={error}>
							<Input
								{...fieldA11y("me-phone", error)}
								type="tel"
								autoComplete="tel"
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

			<form.Field name="bio">
				{(field) => {
					const error = getClientError(field.state.meta) ?? serverErrors.bio;
					const hint = `${field.state.value.length}/${BIO_MAX}`;
					return (
						<FieldShell id="me-bio" label="Bio" optional error={error} hint={hint}>
							<Textarea
								{...fieldA11y("me-bio", error, hint)}
								rows={5}
								placeholder="Training, experience, areas of interest…"
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
							Save changes
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}
