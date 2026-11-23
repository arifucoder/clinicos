import type { UserRole } from "@/lib/authRedirect";
import type { MeResult } from "@/services/auth.service";

// client component-এ শুধু এটুকু যাবে। পুরো MeResult পাঠানোর দরকার নেই
export type ShellUser = Pick<MeResult, "name" | "email" | "image" | "role">;

// doctor-এর ছবি doctorProfile-এ; admin/patient-এর জন্য initials (SDLC: users.image ব্যবহার হয় না)
// dashboard layout আর public navbar দুজনেই এটা ব্যবহার করে
export const toShellUser = (me: MeResult): ShellUser => ({
	name: me.name,
	email: me.email,
	image: me.doctorProfile?.photoUrl ?? me.image,
	role: me.role,
});

export const ROLE_LABELS: Record<UserRole, string> = {
	SUPER_ADMIN: "Super admin",
	ADMIN: "Admin",
	DOCTOR: "Doctor",
	PATIENT: "Patient",
};

export const getInitials = (name: string) =>
	name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("") || "?";
