// api-র patientSelect-এর সাথে মিল (patient-record.service.ts)। Date JSON হয়ে string আসে।
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type BloodGroup =
	| "A_POSITIVE"
	| "A_NEGATIVE"
	| "B_POSITIVE"
	| "B_NEGATIVE"
	| "AB_POSITIVE"
	| "AB_NEGATIVE"
	| "O_POSITIVE"
	| "O_NEGATIVE";

export interface PatientRecord {
	id: string;
	fullName: string;
	phone: string | null;
	dateOfBirth: string | null; // @db.Date → "1990-05-12T00:00:00.000Z"
	gender: Gender | null;
	address: string | null;
	bloodGroup: BloodGroup | null;
	allergies: string | null;
	emergencyContactName: string | null;
	emergencyContactPhone: string | null;
	registeredById: string | null; // null = রোগী নিজে sign up করেছে
	createdAt: string;
	updatedAt: string;
	user: { id: string; email: string; isActive: boolean; needPasswordChange: boolean };
}

// POST /patient-records → api-র response
export interface CreatePatientResult {
	patient: PatientRecord;
	temporaryPassword: string;
	emailSent: boolean;
}

// action → client: card দেখানোর জন্য শুধু যা লাগে
export interface RegisteredPatient {
	patientId: string;
	fullName: string;
	email: string;
	temporaryPassword: string;
	emailSent: boolean;
}

// POST /patient-records/:id/reset-password
export interface ResetPasswordResult {
	temporaryPassword: string;
	emailSent: boolean;
}
