"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Power, PowerOff, Trash2 } from "lucide-react";

// table → columns-এ যা যায়; admin আর doctor দুই table-ই ব্যবহার করে
export interface StaffRowHandlers<TRow> {
	busyId: string | null;
	onEdit: (row: TRow) => void;
	onToggleActive: (row: TRow) => void;
	onDelete: (row: TRow) => void;
}

interface StaffRowActionsProps {
	label: string;
	isActive: boolean;
	busy: boolean;
	onEdit: () => void;
	onToggleActive: () => void;
	onDelete: () => void;
}

export function StaffRowActions({ label, isActive, busy, onEdit, onToggleActive, onDelete }: StaffRowActionsProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={<Button variant="outline" size="icon-sm" aria-label={`Actions for ${label}`} disabled={busy} />}
			>
				<MoreVertical />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuItem onClick={onEdit}>
					<Pencil />
					Edit
				</DropdownMenuItem>
				<DropdownMenuItem onClick={onToggleActive}>
					{isActive ? <PowerOff /> : <Power />}
					{isActive ? "Deactivate" : "Activate"}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive" onClick={onDelete}>
					<Trash2 />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
