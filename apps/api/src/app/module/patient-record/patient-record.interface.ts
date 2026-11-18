import type * as z from "zod";
import type { PatientRecordValidation } from "./patient-record.validation";

export type TCreatePatientPayload = z.infer<typeof PatientRecordValidation.createPatientSchema>;
export type TUpdatePatientPayload = z.infer<typeof PatientRecordValidation.updatePatientSchema>;
export type TUpdateAccountStatusPayload = z.infer<typeof PatientRecordValidation.updateAccountStatusSchema>;
