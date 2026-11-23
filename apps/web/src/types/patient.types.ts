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

export interface CreatePatientResult {
	patient: PatientRecord;
	temporaryPassword: string;
	emailSent: boolean;
}

export interface RegisteredPatient {
	patientId: string;
	fullName: string;
	email: string;
	temporaryPassword: string;
	emailSent: boolean;
}

export interface ResetPasswordResult {
	temporaryPassword: string;
	emailSent: boolean;
}

export interface MyPatientProfile {
	id: string;
	fullName: string;
	email: string;
	phone: string | null;
	dateOfBirth: string | null; // @db.Date → "1990-05-12T00:00:00.000Z"
	gender: Gender | null;
	address: string | null;
	bloodGroup: BloodGroup | null;
	allergies: string | null;
	emergencyContactName: string | null;
	emergencyContactPhone: string | null;
	profileComplete: boolean; // phone + জন্মতারিখ + gender থাকলে true (booking-এর আগে লাগে)
	createdAt: string;
	updatedAt: string;
}
