import type { AppointmentPrescription } from "@/types/appointment.types";
import type { PrescriptionFormOutput, PrescriptionFormValues } from "@/zod/prescription.validation";

// key-এর ক্রম toPrescriptionFormValues-এর item-এর সাথে একই রাখো (snapshot তুলনার জন্য)
export const EMPTY_ITEM: PrescriptionFormValues["items"][number] = {
	medicineName: "",
	dosage: "",
	frequency: "",
	durationDays: "",
	instructions: "",
};

// api → form: null → "", number → string
export const toPrescriptionFormValues = (prescription: AppointmentPrescription | null): PrescriptionFormValues => ({
	symptoms: prescription?.symptoms ?? "",
	diagnosis: prescription?.diagnosis ?? "",
	advice: prescription?.advice ?? "",
	// api "2026-12-01T00:00:00.000Z" পাঠায় (UTC midnight-এ রাখা) → প্রথম ১০ অক্ষর = দিন
	followUpDate: prescription?.followUpDate?.slice(0, 10) ?? "",
	items:
		prescription?.items.map((item) => ({
			medicineName: item.medicineName,
			dosage: item.dosage,
			frequency: item.frequency,
			durationDays: item.durationDays?.toString() ?? "",
			instructions: item.instructions ?? "",
		})) ?? [],
});

const blankToUndefined = (value: string) => (value === "" ? undefined : value);

// form (Zod-এ parse আর trim করা) → api-র PUT body
export const toPrescriptionPayload = (values: PrescriptionFormOutput) => ({
	symptoms: blankToUndefined(values.symptoms),
	diagnosis: values.diagnosis,
	advice: blankToUndefined(values.advice),
	followUpDate: blankToUndefined(values.followUpDate),
	items: values.items.map((item) => ({
		medicineName: item.medicineName,
		dosage: item.dosage,
		frequency: item.frequency,
		durationDays: item.durationDays === "" ? undefined : Number(item.durationDays),
		instructions: blankToUndefined(item.instructions),
	})),
});

export type PrescriptionPayload = ReturnType<typeof toPrescriptionPayload>;
