"use client";

import { registerAction } from "@/actions/auth.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type RegisterPayload, registerSchema } from "@/zod/auth.validation";
import { type AnyFieldMeta, useForm } from "@tanstack/react-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type FieldName = keyof RegisterPayload;

const defaultValues: RegisterPayload = { name: "", email: "", password: "" };

export function SignupForm() {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
	const [formError, setFormError] = useState<string | null>(null);

	const form = useForm({
		defaultValues,
		validators: { onBlur: registerSchema },
		onSubmit: async ({ value }) => {
			setFormError(null);
			setServerErrors({});

			const result = await registerAction(value);

			if (!result.success) {
				if (result.fieldErrors) setServerErrors(result.fieldErrors);
				else setFormError(result.message);
				return;
			}

			toast.success(result.message);
			const email = value.email.trim().toLowerCase();
			router.push(`/verify-email?email=${encodeURIComponent(email)}`);
		},
	});

	// server error আগে, তারপর Zod error (শুধু field ছোঁয়া হলে)
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

			<form.Field name="name">
				{(field) => {
					const error = getError("name", field.state.meta);
					return (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Full name</Label>
							<Input
								id={field.name}
								name={field.name}
								autoComplete="name"
								placeholder="Ayesha Rahman"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => {
									field.handleChange(e.target.value);
									clearServerError("name");
								}}
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

			<form.Field name="email">
				{(field) => {
					const error = getError("email", field.state.meta);
					return (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Email</Label>
							<Input
								id={field.name}
								name={field.name}
								type="email"
								autoComplete="email"
								inputMode="email"
								placeholder="you@example.com"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => {
									field.handleChange(e.target.value);
									clearServerError("email");
								}}
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
					const error = getError("password", field.state.meta);
					return (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Password</Label>
							<div className="relative">
								<Input
									id={field.name}
									name={field.name}
									type={showPassword ? "text" : "password"}
									autoComplete="new-password"
									className="pr-10"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => {
										field.handleChange(e.target.value);
										clearServerError("password");
									}}
									aria-invalid={!!error}
									aria-describedby={`${field.name}-hint${error ? ` ${field.name}-error` : ""}`}
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon-sm"
									className="absolute top-1/2 right-0.5 -translate-y-1/2 text-muted-foreground"
									onClick={() => setShowPassword((v) => !v)}
									aria-label={showPassword ? "Hide password" : "Show password"}
									aria-pressed={showPassword}
								>
									{showPassword ? <EyeOff /> : <Eye />}
								</Button>
							</div>
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

			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader2 className="animate-spin" aria-hidden="true" />
								Creating account…
							</>
						) : (
							"Create account"
						)}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
