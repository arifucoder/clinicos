"use client";

import { deleteSpecialtyAction } from "@/actions/specialty.action";
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
import type { Specialty } from "@/types/specialty.types";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

interface DeleteSpecialtyDialogProps {
	specialty: Specialty | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function DeleteSpecialtyDialog({ specialty, open, onOpenChange }: DeleteSpecialtyDialogProps) {
	const [isPending, startTransition] = useTransition();

	const handleDelete = () => {
		if (!specialty) return;
		startTransition(async () => {
			const result = await deleteSpecialtyAction(specialty.id);
			if (!result.success) {
				toast.error(result.message);
				return;
			}
			toast.success(result.message);
			onOpenChange(false);
		});
	};

	return (
		// চলাকালীন বন্ধ করতে দিই না
		<AlertDialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete “{specialty?.name}”?</AlertDialogTitle>
					<AlertDialogDescription>
						It disappears from this list and from “Find a doctor”. Existing doctor profiles are not changed. The same
						name can&apos;t be used again later, so choose <strong>Deactivate</strong> if you might need it back.
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
						Delete specialty
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
