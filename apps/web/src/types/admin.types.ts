export interface StaffAdmin {
	id: string;
	name: string;
	email: string;
	phone: string | null;
	role: "ADMIN";
	isActive: boolean;
	needPasswordChange: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateAdminResult {
	user: StaffAdmin;
	emailSent: boolean;
}
