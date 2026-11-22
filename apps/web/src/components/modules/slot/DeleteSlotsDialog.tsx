"use client";

import { deleteSlotsAction } from "@/actions/slot.action";
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
import { pluralize } from "@/lib/format";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

interface DeleteSlotsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	doctorId: string;
	slotIds: string[];
	onDone: () => void;
}

export function DeleteSlotsDialog({ open, onOpenChange, doctorId, slotIds, onDone }: DeleteSlotsDialogProps) {
	const [isPending, startTransition] = useTransition();

	const handleDelete = () => {
		startTransition(async () => {
			const result = await deleteSlotsAction(doctorId, slotIds);
			if (!result.success) {
				toast.error(result.message);
				return;
			}
			if (result.data.failed > 0) toast.warning(result.message);
			else toast.success(result.message);
			onDone();
			onOpenChange(false);
		});
	};

	return (
		<AlertDialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete {pluralize(slotIds.length, "slot")}?</AlertDialogTitle>
					<AlertDialogDescription>
						They disappear from the schedule. A slot that ever had a booking can&apos;t be deleted — block it instead.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
					<Button
						onClick={handleDelete}
						disabled={isPending || slotIds.length === 0}
						className="bg-destructive text-white hover:bg-destructive/90"
					>
						{isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
						Delete
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
