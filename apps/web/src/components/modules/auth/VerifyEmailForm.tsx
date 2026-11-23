"use client";

import { resendOtpAction, verifyEmailAction } from "@/actions/auth.action";
import { OTP_LENGTH, OtpCodeInput } from "@/components/modules/auth/OtpCodeInput";
import { Button } from "@/components/ui/button";
import { useResendCountdown } from "@/hooks/useResendCountdown";
import { withNext } from "@/lib/authRedirect";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function VerifyEmailForm({ email, next }: { email: string; next?: string }) {
	const router = useRouter();
	const [otp, setOtp] = useState("");
	const [error, setError] = useState<string | null>(null);
	const countdown = useResendCountdown();
	const [isVerifying, startVerify] = useTransition();
	const [isResending, startResend] = useTransition();

	const verify = (code: string) => {
		if (code.length !== OTP_LENGTH || isVerifying) return;
		setError(null);

		startVerify(async () => {
			const result = await verifyEmailAction({ email, otp: code });

			if (!result.success) {
				setError(result.fieldErrors?.otp ?? result.message);
				setOtp("");
				// ৩ বার ভুল: এই code আর কাজ করবে না → সাথে সাথে Resend চালু
				if (result.code === "TOO_MANY_ATTEMPTS") countdown.finish();
				return;
			}

			toast.success("Email verified. Please log in.");
			router.replace(withNext(`/login?email=${encodeURIComponent(email)}`, next));
		});
	};

	const resend = () => {
		startResend(async () => {
			const result = await resendOtpAction({ email });

			if (!result.success) {
				toast.error(result.message);
				return;
			}

			toast.success(result.message);
			setOtp("");
			setError(null);
			countdown.restart();
		});
	};

	return (
		<form
			className="space-y-6"
			onSubmit={(e) => {
				e.preventDefault();
				verify(otp);
			}}
		>
			<div className="space-y-2">
				<label htmlFor="otp" className="sr-only">
					Verification code
				</label>
				<OtpCodeInput
					id="otp"
					value={otp}
					onChange={(value) => {
						setOtp(value);
						if (error) setError(null);
					}}
					onComplete={verify}
					disabled={isVerifying}
					autoFocus
					invalid={!!error}
					describedBy={error ? "otp-error otp-hint" : "otp-hint"}
				/>
				{error && (
					<p id="otp-error" role="alert" className="text-sm text-destructive">
						{error}
					</p>
				)}
				<p id="otp-hint" className="text-xs text-muted-foreground">
					The code expires in 5 minutes.
				</p>
			</div>

			<Button
				type="submit"
				className="h-12 w-full rounded-lg text-[15px] font-semibold"
				disabled={otp.length !== OTP_LENGTH || isVerifying}
			>
				{isVerifying ? (
					<>
						<Loader2 className="animate-spin" aria-hidden="true" />
						Verifying…
					</>
				) : (
					"Verify email"
				)}
			</Button>

			<p className="text-center text-sm text-muted-foreground" aria-live="polite">
				No code yet?{" "}
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
					<span>Resend in {countdown.label}</span>
				)}
			</p>
		</form>
	);
}
