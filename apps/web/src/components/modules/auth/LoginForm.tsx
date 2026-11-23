"use client";

import { loginAction, resendOtpAction } from "@/actions/auth.action";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type LoginPayload, loginSchema } from "@/zod/auth.validation";
import { type AnyFieldMeta, useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { withNext } from "@/lib/authRedirect";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

const inputClass = "h-11.5 rounded-lg px-3.5 text-[15px] md:text-[15px]";

interface LoginFormProps {
	defaultEmail: string;
	next?: string;
}

export function LoginForm({ defaultEmail, next }: LoginFormProps) {
	const router = useRouter();
	const [formError, setFormError] = useState<string | null>(null);
	const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
	const [isSendingCode, startSendingCode] = useTransition();

	const form = useForm({
		defaultValues: { email: defaultEmail, password: "" } satisfies LoginPayload,
		validators: { onBlur: loginSchema },
		onSubmit: async ({ value }) => {
			setFormError(null);
			setUnverifiedEmail(null);

			const result = await loginAction(value, next);

			if (!result.success) {
				if (result.code === "EMAIL_NOT_VERIFIED") {
					setUnverifiedEmail(value.email.trim().toLowerCase());
				} else {
					setFormError(result.message);
				}
				form.setFieldValue("password", "");
				return;
			}

			toast.success(result.message);
			router.replace(result.data.redirectTo);
			// navbar-এর মতো server component নতুন cookie দিয়ে আবার render হবে
			router.refresh();
		},
	});

	const sendCodeAndVerify = () => {
		if (!unverifiedEmail) return;
		startSendingCode(async () => {
			const result = await resendOtpAction({ email: unverifiedEmail });
			if (!result.success) {
				toast.error(result.message);
				return;
			}
			toast.success("We sent you a new code.");
			router.push(withNext(`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`, next));
		});
	};

	const getError = (meta: AnyFieldMeta): string | undefined => {
		if (!meta.isTouched) return undefined;
		const first = meta.errors[0];
		return typeof first === "string" ? first : first?.message;
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

			{unverifiedEmail && (
				<div
					role="alert"
					className="space-y-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-900"
				>
					<p>Please verify your email before logging in.</p>
					<Button type="button" size="sm" variant="outline" onClick={sendCodeAndVerify} disabled={isSendingCode}>
						{isSendingCode && <Loader2 className="animate-spin" aria-hidden="true" />}
						Send code and verify
					</Button>
				</div>
			)}

			<form.Field name="email">
				{(field) => {
					const error = getError(field.state.meta);
					return (
						<div className="space-y-2">
							<Label htmlFor={field.name} className="text-[13px]">
								Email
							</Label>
							<Input
								id={field.name}
								name={field.name}
								type="email"
								autoComplete="email"
								inputMode="email"
								placeholder="you@example.com"
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

			<form.Field name="password">
				{(field) => {
					const error = getError(field.state.meta);
					return (
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor={field.name} className="text-[13px]">
									Password
								</Label>
								<form.Subscribe selector={(state) => state.values.email.trim()}>
									{(email) => (
										<Link
											href={email ? `/forgot-password?email=${encodeURIComponent(email)}` : "/forgot-password"}
											className="text-[13px] font-medium text-primary underline-offset-4 hover:underline"
										>
											Forgot password?
										</Link>
									)}
								</form.Subscribe>
							</div>
							<PasswordInput
								id={field.name}
								name={field.name}
								autoComplete="current-password"
								autoFocus={!!defaultEmail}
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
								Logging in…
							</>
						) : (
							"Log in"
						)}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
