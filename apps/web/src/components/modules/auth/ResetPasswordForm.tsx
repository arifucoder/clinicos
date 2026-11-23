"use client";

import { forgetPasswordAction, resetPasswordAction } from "@/actions/auth.action";
import { OtpCodeInput } from "@/components/modules/auth/OtpCodeInput";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useResendCountdown } from "@/hooks/useResendCountdown";
import { type ResetPasswordFormValues, resetPasswordFormSchema } from "@/zod/auth.validation";
import { type AnyFieldMeta, useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

type FieldName = keyof ResetPasswordFormValues;

const inputClass = "h-11.5 rounded-lg px-3.5 text-[15px] md:text-[15px]";

export function ResetPasswordForm({ email }: { email: string }) {
	const router = useRouter();
	const [formError, setFormError] = useState<string | null>(null);
	const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
	const countdown = useResendCountdown();
	const [isResending, startResend] = useTransition();

	const form = useForm({
		defaultValues: { otp: "", newPassword: "", confirmPassword: "" } satisfies ResetPasswordFormValues,
		validators: { onBlur: resetPasswordFormSchema },
		onSubmit: async ({ value }) => {
			setFormError(null);
			setServerErrors({});

			const result = await resetPasswordAction({ email, otp: value.otp, newPassword: value.newPassword });

			if (!result.success) {
				if (result.fieldErrors) setServerErrors(result.fieldErrors);
				else setFormError(result.message);

				if (result.fieldErrors?.otp || result.code === "TOO_MANY_ATTEMPTS") form.setFieldValue("otp", "");
				if (result.code === "TOO_MANY_ATTEMPTS") countdown.finish();
				return;
			}

			toast.success("Password updated. Please log in.");
			router.replace(`/login?email=${encodeURIComponent(email)}`);
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

	const resend = () => {
		startResend(async () => {
			const result = await forgetPasswordAction({ email });
			if (!result.success) {
				toast.error(result.message);
				return;
			}
			toast.success(result.message);
			form.setFieldValue("otp", "");
			clearServerError("otp");
			setFormError(null);
			countdown.restart();
		});
	};

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

			<form.Field name="otp">
				{(field) => {
					const error = getError("otp", field.state.meta);
					return (
						<div className="space-y-2">
							<Label htmlFor="otp" className="text-[13px]">
								Reset code
							</Label>
							<OtpCodeInput
								id="otp"
								value={field.state.value}
								onChange={(value) => {
									field.handleChange(value);
									clearServerError("otp");
								}}
								onBlur={field.handleBlur}
								autoFocus
								invalid={!!error}
								describedBy={error ? "otp-error" : undefined}
							/>
							{error && (
								<p id="otp-error" className="text-sm text-destructive">
									{error}
								</p>
							)}
							<p className="text-sm text-muted-foreground" aria-live="polite">
								{countdown.canResend ? (
									<button
										type="button"
										onClick={resend}
										disabled={isResending}
										className="font-medium text-primary underline-offset-4 hover:underline disabled:opacity-50"
									>
										{isResending ? "Sending…" : "Resend code"}
									</button>
								) : (
									<span>Resend code in {countdown.label}</span>
								)}
							</p>
						</div>
					);
				}}
			</form.Field>

			<form.Field name="newPassword">
				{(field) => {
					const error = getError("newPassword", field.state.meta);
					return (
						<div className="space-y-2">
							<Label htmlFor={field.name} className="text-[13px]">
								New password
							</Label>
							<PasswordInput
								id={field.name}
								name={field.name}
								autoComplete="new-password"
								className={inputClass}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => {
									field.handleChange(e.target.value);
									clearServerError("newPassword");
								}}
								aria-invalid={!!error}
								aria-describedby={`${field.name}-hint${error ? ` ${field.name}-error` : ""}`}
							/>
							<p id={`${field.name}-hint`} className="text-xs text-muted-foreground">
								At least 8 characters.
							</p>
							{error && (
								<p id={`${field.name}-error`} className="text-sm text-destructive">
									{error}
								</p>
							)}
						</div>
					);
				}}
			</form.Field>

			<form.Field name="confirmPassword">
				{(field) => {
					const error = getError("confirmPassword", field.state.meta);
					return (
						<div className="space-y-2">
							<Label htmlFor={field.name} className="text-[13px]">
								Confirm new password
							</Label>
							<PasswordInput
								id={field.name}
								name={field.name}
								autoComplete="new-password"
								className={inputClass}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								aria-invalid={!!error}
								aria-describedby={error ? `${field.name}-error` : undefined}
							/>
							{error && (
								<p id={`${field.name}-error`} className="text-sm text-destructive">
									{error}
								</p>
							)}
						</div>
					);
				}}
			</form.Field>

			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<Button type="submit" className="h-12 w-full rounded-lg text-[15px] font-semibold" disabled={isSubmitting}>
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
