"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PatientRecord } from "@/types/patient.types";
import { KeyRound, MoreVertical, Power, PowerOff } from "lucide-react";

export interface PatientRowHandlers {
	busyId: string | null;
	onToggleActive: (patient: PatientRecord) => void;
	onResetPassword: (patient: PatientRecord) => void;
}

export function PatientRowActions({
	patient,
	busyId,
	onToggleActive,
	onResetPassword,
}: PatientRowHandlers & { patient: PatientRecord }) {
	const isActive = patient.user.isActive;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant="outline"
						size="icon-sm"
						aria-label={`Actions for ${patient.fullName}`}
						disabled={busyId === patient.id}
					/>
				}
			>
				<MoreVertical />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-52">
				{/* বন্ধ account-এর password reset অর্থহীন: login তো হবেই না */}
				<DropdownMenuItem disabled={!isActive} onClick={() => onResetPassword(patient)}>
					<KeyRound />
					Reset password
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant={isActive ? "destructive" : "default"} onClick={() => onToggleActive(patient)}>
					{isActive ? <PowerOff /> : <Power />}
					{isActive ? "Deactivate account" : "Activate account"}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
