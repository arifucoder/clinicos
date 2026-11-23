"use client";

import { createAdminAction, updateAdminAction } from "@/actions/admin.action";
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
import { useServerFieldErrors } from "@/hooks/useServerFieldErrors";
import { fieldA11y, getClientError } from "@/lib/formField";
import type { StaffAdmin } from "@/types/admin.types";
import type { ActionError } from "@/types/api.types";
import { type AdminFormValues, adminFormSchema } from "@/zod/admin.validation";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AdminFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	admin?: StaffAdmin | null;
}

export function AdminFormDialog({ open, onOpenChange, admin }: AdminFormDialogProps) {
	const isEdit = !!admin;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{isEdit ? "Edit admin" : "New admin"}</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Email can't be changed. To use another email, delete this admin and add a new one."
							: "We email them a temporary password. They must change it on first login."}
					</DialogDescription>
				</DialogHeader>
				<AdminForm key={admin?.id ?? "new"} admin={admin} onDone={() => onOpenChange(false)} />
			</DialogContent>
		</Dialog>
	);
}

function AdminForm({ admin, onDone }: { admin?: StaffAdmin | null; onDone: () => void }) {
	const [formError, setFormError] = useState<string | null>(null);
	const { serverErrors, setServerErrors, clearServerError } = useServerFieldErrors();

	const showError = (result: ActionError) => {
		if (result.fieldErrors) setServerErrors(result.fieldErrors);
		else setFormError(result.message);
	};

	const form = useForm({
		defaultValues: {
			name: admin?.name ?? "",
			email: admin?.email ?? "",
			phone: admin?.phone ?? "",
		} satisfies AdminFormValues,
		validators: { onBlur: adminFormSchema },
		onSubmit: async ({ value }) => {
			setFormError(null);
			setServerErrors({});

			if (admin) {
				const result = await updateAdminAction(admin.id, value);
				if (!result.success) return showError(result);
				toast.success(result.message);
			} else {
				const result = await createAdminAction(value);
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

			<form.Field name="name">
				{(field) => {
					const error = getClientError(field.state.meta) ?? serverErrors.name;
					return (
						<FieldShell id="admin-name" label="Full name" error={error}>
							<Input
								{...fieldA11y("admin-name", error)}
								autoFocus
								autoComplete="off"
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
						<FieldShell id="admin-email" label="Email" error={error}>
							<Input
								{...fieldA11y("admin-email", error)}
								type="email"
								autoComplete="off"
								readOnly={!!admin}
								className={admin ? "bg-muted text-muted-foreground" : undefined}
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
						<FieldShell id="admin-phone" label="Phone" optional error={error}>
							<Input
								{...fieldA11y("admin-phone", error)}
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

			<DialogFooter>
				<DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button type="submit" disabled={isSubmitting} className="min-w-28">
							{isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
							{admin ? "Save changes" : "Create admin"}
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}
