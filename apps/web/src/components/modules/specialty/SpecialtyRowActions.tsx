"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Specialty } from "@/types/specialty.types";
import { MoreVertical, Pencil, Power, PowerOff, Trash2 } from "lucide-react";

export interface SpecialtyRowHandlers {
	onEdit: (specialty: Specialty) => void;
	onToggleActive: (specialty: Specialty) => void;
	onDelete: (specialty: Specialty) => void;
	busyId: string | null;
}

export function SpecialtyRowActions({
	specialty,
	onEdit,
	onToggleActive,
	onDelete,
	busyId,
}: SpecialtyRowHandlers & { specialty: Specialty }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant="outline"
						size="icon-sm"
						aria-label={`Actions for ${specialty.name}`}
						disabled={busyId === specialty.id}
					/>
				}
			>
				<MoreVertical />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuItem onClick={() => onEdit(specialty)}>
					<Pencil />
					Edit
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => onToggleActive(specialty)}>
					{specialty.isActive ? <PowerOff /> : <Power />}
					{specialty.isActive ? "Deactivate" : "Activate"}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive" onClick={() => onDelete(specialty)}>
					<Trash2 />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
