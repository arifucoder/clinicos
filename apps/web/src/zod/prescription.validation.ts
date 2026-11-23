import * as z from "zod";

const durationDays = z
	.string()
	.trim()
	.refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 365), {
		error: "Enter 1–365 days",
	});

export const prescriptionItemFormSchema = z.object({
	medicineName: z.string().trim().min(1, "Medicine name is required").max(120),
	dosage: z.string().trim().min(1, "Dosage is required").max(60),
	frequency: z.string().trim().min(1, "Frequency is required").max(60),
	durationDays,
	instructions: z.string().trim().max(200, "Keep it under 200 characters"),
});

export const prescriptionFormSchema = z.object({
	symptoms: z.string().trim().max(1000, "Keep it under 1000 characters"),
	diagnosis: z.string().trim().min(1, "Diagnosis is required").max(1000, "Keep it under 1000 characters"),
	advice: z.string().trim().max(1000, "Keep it under 1000 characters"),
	followUpDate: z.union([z.literal(""), z.iso.date("Pick a valid date")]),
	items: z.array(prescriptionItemFormSchema).max(30, "Up to 30 medicines"),
});

export type PrescriptionFormValues = z.input<typeof prescriptionFormSchema>;
export type PrescriptionFormOutput = z.output<typeof prescriptionFormSchema>;
