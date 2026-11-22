// api-র Specialty (isDeleted/deletedAt api নিজেই বাদ দেয়)। Date JSON হয়ে string আসে।
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
