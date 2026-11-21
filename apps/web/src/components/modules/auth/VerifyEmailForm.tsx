"use client";

import { resendOtpAction, verifyEmailAction } from "@/actions/auth.action";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

const formatSeconds = (seconds: number) => `0:${String(seconds).padStart(2, "0")}`;

export function VerifyEmailForm({ email }: { email: string }) {
	const router = useRouter();
	const [otp, setOtp] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
	const [isVerifying, startVerify] = useTransition();
	const [isResending, startResend] = useTransition();

	// প্রতি সেকেন্ডে ১ কমে; ০ হলে থামে
	useEffect(() => {
		if (secondsLeft <= 0) return;
		const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
		return () => clearTimeout(timer);
	}, [secondsLeft]);

	const verify = (code: string) => {
		if (code.length !== OTP_LENGTH || isVerifying) return;
		setError(null);

		startVerify(async () => {
			const result = await verifyEmailAction({ email, otp: code });

			if (!result.success) {
				setError(result.fieldErrors?.otp ?? result.message);
				setOtp("");
				return;
			}

			toast.success("Email verified. Please log in.");
			// replace: Back চাপলে আবার OTP page-এ ফিরবে না
			router.replace(`/login?email=${encodeURIComponent(email)}`);
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
			setSecondsLeft(RESEND_SECONDS);
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
				<InputOTP
					id="otp"
					maxLength={OTP_LENGTH}
					pattern={REGEXP_ONLY_DIGITS}
					value={otp}
					onChange={(value) => {
						setOtp(value);
						if (error) setError(null);
					}}
					onComplete={verify}
					disabled={isVerifying}
					autoFocus
					aria-invalid={!!error}
					aria-describedby={error ? "otp-error otp-hint" : "otp-hint"}
				>
					<InputOTPGroup>
						{Array.from({ length: OTP_LENGTH }, (_, index) => (
							<InputOTPSlot key={index} index={index} className="size-12 text-lg" />
						))}
					</InputOTPGroup>
				</InputOTP>

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
				{secondsLeft > 0 ? (
					<span>Resend in {formatSeconds(secondsLeft)}</span>
				) : (
					<button
						type="button"
						onClick={resend}
						disabled={isResending}
						className="font-medium text-primary underline-offset-4 hover:underline disabled:opacity-50"
					>
						{isResending ? "Sending…" : "Resend code"}
					</button>
				)}
			</p>
		</form>
	);
}
