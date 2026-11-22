"use client";

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/types/api.types";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

interface DeleteStaffDialogProps {
	target: { id: string; name: string } | null;
	kind: "admin" | "doctor";
	open: boolean;
	onOpenChange: (open: boolean) => void;
	deleteAction: (id: string) => Promise<ActionResult>;
}

const CONSEQUENCES = {
	admin: "They are signed out right away and can no longer log in.",
	doctor:
		"They are signed out right away, can no longer log in and disappear from “Find a doctor”. Past appointments and prescriptions keep their name.",
} as const;

export function DeleteStaffDialog({ target, kind, open, onOpenChange, deleteAction }: DeleteStaffDialogProps) {
	const [isPending, startTransition] = useTransition();

	const handleDelete = () => {
		if (!target) return;
		startTransition(async () => {
			const result = await deleteAction(target.id);
			if (!result.success) {
				toast.error(result.message);
				return;
			}
			toast.success(result.message);
			onOpenChange(false);
		});
	};

	return (
		<AlertDialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete {target?.name}?</AlertDialogTitle>
					<AlertDialogDescription>
						{CONSEQUENCES[kind]} Their email can&apos;t be used for a new account later, so choose{" "}
						<strong>Deactivate</strong> if they might come back.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
					<Button
						onClick={handleDelete}
						disabled={isPending}
						className="bg-destructive text-white hover:bg-destructive/90"
					>
						{isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
						Delete {kind}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
