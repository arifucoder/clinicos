import type { AppointmentPrescription } from "@/types/appointment.types";
import type { PrescriptionFormOutput, PrescriptionFormValues } from "@/zod/prescription.validation";

export const EMPTY_ITEM: PrescriptionFormValues["items"][number] = {
	medicineName: "",
	dosage: "",
	frequency: "",
	durationDays: "",
	instructions: "",
};

export const toPrescriptionFormValues = (prescription: AppointmentPrescription | null): PrescriptionFormValues => ({
	symptoms: prescription?.symptoms ?? "",
	diagnosis: prescription?.diagnosis ?? "",
	advice: prescription?.advice ?? "",
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
