import type * as z from "zod";
import type { AppointmentValidation } from "./appointment.validation";

export type TBookAppointmentPayload = z.infer<typeof AppointmentValidation.bookAppointmentSchema>;
export type TCancelAppointmentPayload = z.infer<typeof AppointmentValidation.cancelAppointmentSchema>;
export type TCancelMyAppointmentPayload = z.infer<typeof AppointmentValidation.cancelMyAppointmentSchema>;
export type TDeskPaymentPayload = z.infer<typeof AppointmentValidation.deskPaymentSchema>;
export type TPrescriptionPayload = z.infer<typeof AppointmentValidation.prescriptionSchema>;
