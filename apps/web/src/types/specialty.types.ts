export interface Specialty {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	icon: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface PublicSpecialty {
	name: string;
	slug: string;
	icon: string | null;
	doctorCount: number;
}
