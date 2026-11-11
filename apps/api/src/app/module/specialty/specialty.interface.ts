import type * as z from "zod";
import type { SpecialtyValidation } from "./specialty.validation";

export type TCreateSpecialtyPayload = z.infer<typeof SpecialtyValidation.createSpecialtySchema>;
