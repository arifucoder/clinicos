import type * as z from "zod";
import type { AdminValidation } from "./admin.validation";

export type TUpdateAdminPayload = z.infer<typeof AdminValidation.updateAdminSchema>;
export type TUpdateAdminStatusPayload = z.infer<typeof AdminValidation.updateAdminStatusSchema>;
