import type * as z from "zod";
import type { AuthValidation } from "./auth.validation";

export type TRegisterPayload = z.infer<typeof AuthValidation.registerSchema>;
export type TVerifyEmailPayload = z.infer<typeof AuthValidation.verifyEmailSchema>;
export type TResendOtpPayload = z.infer<typeof AuthValidation.resendOtpSchema>;
export type TLoginPayload = z.infer<typeof AuthValidation.loginSchema>;
export type TChangePasswordPayload = z.infer<typeof AuthValidation.changePasswordSchema>;
export type TForgetPasswordPayload = z.infer<typeof AuthValidation.forgetPasswordSchema>;
export type TResetPasswordPayload = z.infer<typeof AuthValidation.resetPasswordSchema>;
