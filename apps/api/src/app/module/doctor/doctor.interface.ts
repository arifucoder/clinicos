import type * as z from "zod";
import type { DoctorValidation } from "./doctor.validation";

export type TUpdateDoctorPayload = z.infer<typeof DoctorValidation.updateDoctorSchema>;
export type TUpdateDoctorStatusPayload = z.infer<typeof DoctorValidation.updateDoctorStatusSchema>;
