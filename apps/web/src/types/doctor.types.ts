export interface SpecialtyRef {
	id: string;
	name: string;
	slug: string;
}

// api-র doctorSelect + toDoctorResponse (doctor.service.ts)
export interface StaffDoctor {
	id: string; // doctorProfile-এর id — /doctors/:id এটাই চায়, user.id না
	licenseNumber: string;
	consultationFeeCents: number;
	roomNumber: string | null;
	bio: string | null;
	photoUrl: string | null;
	isPaused: boolean;
	createdAt: string;
	updatedAt: string;
	user: {
		id: string;
		name: string;
		email: string;
		phone: string | null;
		isActive: boolean;
		needPasswordChange: boolean;
	};
	specialties: SpecialtyRef[];
}

// POST /users/doctors → { user, doctorProfile, emailSent }; এখানে যেটুকু লাগে
export interface CreateDoctorResult {
	user: { id: string; name: string; email: string };
	doctorProfile: { id: string };
	emailSent: boolean;
}
