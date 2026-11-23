"use client";

import { createSpecialtyAction, updateSpecialtyAction } from "@/actions/specialty.action";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Specialty } from "@/types/specialty.types";
import { type SpecialtyFormValues, specialtyFormSchema } from "@/zod/specialty.validation";
import { type AnyFieldMeta, useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SpecialtyFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	specialty?: Specialty | null;
}

export function SpecialtyFormDialog({ open, onOpenChange, specialty }: SpecialtyFormDialogProps) {
	const isEdit = !!specialty;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{isEdit ? "Edit specialty" : "New specialty"}</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Renaming also changes the URL slug patients see."
							: "Active specialties appear in “Find a doctor” and on doctor profiles."}
					</DialogDescription>
				</DialogHeader>
				<SpecialtyForm key={specialty?.id ?? "new"} specialty={specialty} onDone={() => onOpenChange(false)} />
			</DialogContent>
		</Dialog>
	);
}

const getClientError = (meta: AnyFieldMeta): string | undefined => {
	if (!meta.isTouched) return undefined;
	const first = meta.errors[0];
	return typeof first === "string" ? first : first?.message;
};

function SpecialtyForm({ specialty, onDone }: { specialty?: Specialty | null; onDone: () => void }) {
	const [formError, setFormError] = useState<string | null>(null);
	const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

	const clearServerError = (name: string) =>
		setServerErrors((previous) => {
			if (!(name in previous)) return previous;
			const next = { ...previous };
			delete next[name];
			return next;
		});

	const form = useForm({
		defaultValues: {
			name: specialty?.name ?? "",
			description: specialty?.description ?? "",
			icon: specialty?.icon ?? "",
		} satisfies SpecialtyFormValues,
		validators: { onBlur: specialtyFormSchema },
		onSubmit: async ({ value }) => {
			setFormError(null);
			setServerErrors({});

			const result = specialty ? await updateSpecialtyAction(specialty.id, value) : await createSpecialtyAction(value);

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
						<div className="space-y-2">
							<Label htmlFor="specialty-name" className="text-[13px]">
								Name
							</Label>
							<Input
								id="specialty-name"
								autoFocus
								placeholder="e.g. Cardiology"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => {
									field.handleChange(event.target.value);
									clearServerError("name");
								}}
								aria-invalid={!!error}
								aria-describedby={error ? "specialty-name-error" : undefined}
							/>
							{error && (
								<p id="specialty-name-error" className="text-sm text-destructive">
									{error}
								</p>
							)}
						</div>
					);
				}}
			</form.Field>

			<form.Field name="description">
				{(field) => {
					const error = getClientError(field.state.meta) ?? serverErrors.description;
					return (
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="specialty-description" className="text-[13px]">
									Description <span className="font-normal text-muted-foreground">(optional)</span>
								</Label>
								<span className="text-xs text-muted-foreground tabular-nums">{field.state.value.length}/500</span>
							</div>
							<Textarea
								id="specialty-description"
								rows={3}
								placeholder="Heart and blood vessel care"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => {
									field.handleChange(event.target.value);
									clearServerError("description");
								}}
								aria-invalid={!!error}
								aria-describedby={error ? "specialty-description-error" : undefined}
							/>
							{error && (
								<p id="specialty-description-error" className="text-sm text-destructive">
									{error}
								</p>
							)}
						</div>
					);
				}}
			</form.Field>

			<form.Field name="icon">
				{(field) => {
					const error = getClientError(field.state.meta) ?? serverErrors.icon;
					return (
						<div className="space-y-2">
							<Label htmlFor="specialty-icon" className="text-[13px]">
								Icon <span className="font-normal text-muted-foreground">(optional)</span>
							</Label>
							<Input
								id="specialty-icon"
								placeholder="HeartPulse"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => {
									field.handleChange(event.target.value);
									clearServerError("icon");
								}}
								aria-invalid={!!error}
								aria-describedby="specialty-icon-hint"
							/>
							<p
								id="specialty-icon-hint"
								className={error ? "text-sm text-destructive" : "text-xs text-muted-foreground"}
							>
								{error ?? "A lucide icon name, used on the public site."}
							</p>
						</div>
					);
				}}
			</form.Field>

			<DialogFooter>
				<DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button type="submit" disabled={isSubmitting} className="min-w-28">
							{isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
							{specialty ? "Save changes" : "Create"}
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}
