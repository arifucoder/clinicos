import type * as z from "zod";
import type { DoctorValidation } from "./doctor.validation";

export type TUpdateDoctorPayload = z.infer<typeof DoctorValidation.updateDoctorSchema>;
export type TUpdateDoctorStatusPayload = z.infer<typeof DoctorValidation.updateDoctorStatusSchema>;
export type TUpdateMyProfilePayload = z.infer<typeof DoctorValidation.updateMyProfileSchema>;
export type TPublicDoctorQuery = z.infer<typeof DoctorValidation.publicDoctorQuerySchema>;
