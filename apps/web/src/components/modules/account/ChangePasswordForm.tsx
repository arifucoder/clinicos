"use client";

import { changePasswordAction } from "@/actions/auth.action";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { type ChangePasswordFormValues, changePasswordFormSchema } from "@/zod/auth.validation";
import { type AnyFieldMeta, useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type FieldName = keyof ChangePasswordFormValues;

const EMPTY_VALUES = { currentPassword: "", newPassword: "", confirmPassword: "" } satisfies ChangePasswordFormValues;

interface ChangePasswordFormProps {
	// temporary password দিয়ে প্রথম login হলে: বদলানোর পর নিজের home-এ পাঠাই
	redirectTo?: string;
}

export function ChangePasswordForm({ redirectTo }: ChangePasswordFormProps) {
	const router = useRouter();
	const [formError, setFormError] = useState<string | null>(null);
	const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

	const form = useForm({
		defaultValues: EMPTY_VALUES,
		validators: { onBlur: changePasswordFormSchema, onSubmit: changePasswordFormSchema },
		onSubmit: async ({ value }) => {
			setFormError(null);
			setServerErrors({});

			// confirmPassword পাঠাই না — ওটা শুধু টাইপের ভুল ধরার জন্য
			const result = await changePasswordAction({
				currentPassword: value.currentPassword,
				newPassword: value.newPassword,
			});

			if (!result.success) {
				if (result.fieldErrors) setServerErrors(result.fieldErrors);
				else setFormError(result.message);
				return;
			}

			toast.success("Password changed. Other devices have been logged out.");
			form.reset(EMPTY_VALUES); // password field-এ পুরনো লেখা রেখে দেওয়া ঠিক না

			if (redirectTo) router.replace(redirectTo);
			else router.refresh(); // "Set your own password" banner চলে যাবে
		},
	});

	const getError = (name: FieldName, meta: AnyFieldMeta): string | undefined => {
		if (serverErrors[name]) return serverErrors[name];
		if (!meta.isTouched) return undefined;
		const first = meta.errors[0];
		return typeof first === "string" ? first : first?.message;
	};

	const clearServerError = (name: FieldName) => {
		if (!serverErrors[name]) return;
		setServerErrors((prev) => {
			const next = { ...prev };
			delete next[name];
			return next;
		});
	};

	const renderPasswordField = (
		name: FieldName,
		label: string,
		autoComplete: "current-password" | "new-password",
		hint?: string,
	) => (
		<form.Field name={name}>
			{(field) => {
				const error = getError(name, field.state.meta);
				const describedBy = [hint && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(" ");
				return (
					<div className="space-y-2">
						<Label htmlFor={name}>{label}</Label>
						<PasswordInput
							id={name}
							name={name}
							autoComplete={autoComplete}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => {
								field.handleChange(e.target.value);
								clearServerError(name);
							}}
							aria-invalid={!!error}
							aria-describedby={describedBy || undefined}
						/>
						{hint && (
							<p id={`${name}-hint`} className="text-xs text-muted-foreground">
								{hint}
							</p>
						)}
						{error && (
							<p id={`${name}-error`} className="text-sm text-destructive">
								{error}
							</p>
						)}
					</div>
				);
			}}
		</form.Field>
	);

	return (
		<form
			noValidate
			className="space-y-5"
			onSubmit={(e) => {
				e.preventDefault();
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

			{renderPasswordField("currentPassword", "Current password", "current-password")}
			{renderPasswordField("newPassword", "New password", "new-password", "At least 8 characters.")}
			{renderPasswordField("confirmPassword", "Confirm new password", "new-password")}

			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
						{isSubmitting ? (
							<>
								<Loader2 className="animate-spin" aria-hidden="true" />
								Updating…
							</>
						) : (
							"Update password"
						)}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
