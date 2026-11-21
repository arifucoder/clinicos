"use client";

import { forgetPasswordAction } from "@/actions/auth.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ForgetPasswordPayload, forgetPasswordSchema } from "@/zod/auth.validation";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function ForgotPasswordForm({ defaultEmail }: { defaultEmail: string }) {
	const router = useRouter();
	const [formError, setFormError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: { email: defaultEmail } satisfies ForgetPasswordPayload,
		validators: { onBlur: forgetPasswordSchema },
		onSubmit: async ({ value }) => {
			setFormError(null);

			const result = await forgetPasswordAction(value);
			if (!result.success) {
				setFormError(result.message);
				return;
			}

			// account থাকুক বা না থাকুক, একই পথ (user enumeration ঠেকাতে)
			toast.success(result.message);
			router.push(`/reset-password?email=${encodeURIComponent(value.email.trim().toLowerCase())}`);
		},
	});

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

			<form.Field name="email">
				{(field) => {
					const first = field.state.meta.isTouched ? field.state.meta.errors[0] : undefined;
					const error = typeof first === "string" ? first : first?.message;
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
								autoFocus={!defaultEmail}
								placeholder="you@example.com"
								className="h-11.5 rounded-lg px-3.5 text-[15px] md:text-[15px]"
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
								Sending code…
							</>
						) : (
							"Send reset code"
						)}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
