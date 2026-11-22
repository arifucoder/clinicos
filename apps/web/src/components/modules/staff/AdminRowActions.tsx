"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StaffAdmin } from "@/types/admin.types";
import { MoreVertical, Power, PowerOff } from "lucide-react";

// Edit আর Delete step 3-এ যোগ হবে
export interface AdminRowHandlers {
	onToggleActive: (admin: StaffAdmin) => void;
	busyId: string | null;
}

export function AdminRowActions({ admin, onToggleActive, busyId }: AdminRowHandlers & { admin: StaffAdmin }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant="outline"
						size="icon-sm"
						aria-label={`Actions for ${admin.name}`}
						disabled={busyId === admin.id}
					/>
				}
			>
				<MoreVertical />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuItem onClick={() => onToggleActive(admin)}>
					{admin.isActive ? <PowerOff /> : <Power />}
					{admin.isActive ? "Deactivate" : "Activate"}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
