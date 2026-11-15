import type * as z from "zod";
import type { AuthValidation } from "./auth.validation";

export type TRegisterPayload = z.infer<typeof AuthValidation.registerSchema>;
export type TVerifyEmailPayload = z.infer<typeof AuthValidation.verifyEmailSchema>;
export type TResendOtpPayload = z.infer<typeof AuthValidation.resendOtpSchema>;
export type TLoginPayload = z.infer<typeof AuthValidation.loginSchema>;
