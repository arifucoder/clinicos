"use client";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

export const OTP_LENGTH = 6;

interface OtpCodeInputProps {
	id: string;
	value: string;
	onChange: (value: string) => void;
	onComplete?: (value: string) => void;
	onBlur?: () => void;
	disabled?: boolean;
	invalid?: boolean;
	describedBy?: string;
	autoFocus?: boolean;
}

export function OtpCodeInput({ invalid, describedBy, ...props }: OtpCodeInputProps) {
	return (
		<InputOTP
			{...props}
			maxLength={OTP_LENGTH}
			pattern={REGEXP_ONLY_DIGITS}
			aria-invalid={invalid}
			aria-describedby={describedBy}
		>
			<InputOTPGroup>
				{Array.from({ length: OTP_LENGTH }, (_, index) => (
					// slot-এ aria-invalid দিলে তবেই লাল border আসে
					<InputOTPSlot key={index} index={index} aria-invalid={invalid} className="size-12 text-lg" />
				))}
			</InputOTPGroup>
		</InputOTP>
	);
}
