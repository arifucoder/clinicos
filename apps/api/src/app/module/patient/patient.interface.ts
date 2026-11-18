import type * as z from "zod";
import type { PatientValidation } from "./patient.validation";

export type TUpdateMyProfilePayload = z.infer<typeof PatientValidation.updateMyProfileSchema>;
