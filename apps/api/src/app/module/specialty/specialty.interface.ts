import type * as z from "zod";
import type { SpecialtyValidation } from "./specialty.validation";

export type TCreateSpecialtyPayload = z.infer<typeof SpecialtyValidation.createSpecialtySchema>;
export type TUpdateSpecialtyPayload = z.infer<typeof SpecialtyValidation.updateSpecialtySchema>;
export type TSpecialtyQuery = z.infer<typeof SpecialtyValidation.getSpecialtiesQuerySchema>;
