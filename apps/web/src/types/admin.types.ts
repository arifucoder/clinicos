// api-র adminSelect-এর সাথে মিল (admin.service.ts)। Date JSON হয়ে string আসে।
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

// POST /users/admins → { user, emailSent }; password কখনো response-এ আসে না
export interface CreateAdminResult {
	user: StaffAdmin;
	emailSent: boolean;
}
