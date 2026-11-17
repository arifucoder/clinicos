import type * as z from "zod";
import type { UserValidation } from "./user.validation";

export type TCreateAdminPayload = z.infer<typeof UserValidation.createAdminSchema>;
