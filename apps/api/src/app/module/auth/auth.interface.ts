import type * as z from "zod";
import type { AuthValidation } from "./auth.validation";

export type TRegisterPayload = z.infer<typeof AuthValidation.registerSchema>;
