"use client";

import { blockSlotsAction } from "@/actions/slot.action";
import { FieldShell } from "@/components/shared/form/FieldShell";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useServerFieldErrors } from "@/hooks/useServerFieldErrors";
import { pluralize } from "@/lib/format";
import { fieldA11y, getClientError } from "@/lib/formField";
import { blockSlotsFormSchema, type BlockSlotsFormValues } from "@/zod/slot.validation";
import { useForm } from "@tanstack/react-form";
import { Loader2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BlockSlotsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	doctorId: string;
	slotIds: string[];
	bookedCount: number;
	onDone: () => void;
}

export function BlockSlotsDialog({
	open,
	onOpenChange,
	doctorId,
	slotIds,
	bookedCount,
	onDone,
}: BlockSlotsDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Block {pluralize(slotIds.length, "slot")}</DialogTitle>
					<DialogDescription>
						Patients can&apos;t book blocked slots. You can unblock future slots later.
					</DialogDescription>
				</DialogHeader>

				{bookedCount > 0 && (
					<p
						role="alert"
						className="flex gap-2 rounded-md border border-warning/30 bg-warning-soft px-3 py-2 text-sm text-warning-foreground"
					>
						<TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
						{pluralize(bookedCount, "booked appointment")} will be cancelled. Patients get an email with your reason,
						and online payments are refunded.
					</p>
				)}

				<BlockForm
					doctorId={doctorId}
					slotIds={slotIds}
					onDone={() => {
						onDone();
						onOpenChange(false);
					}}
				/>
			</DialogContent>
		</Dialog>
	);
}

interface BlockFormProps {
	doctorId: string;
	slotIds: string[];
	onDone: () => void;
}

function BlockForm({ doctorId, slotIds, onDone }: BlockFormProps) {
	const [formError, setFormError] = useState<string | null>(null);
	const { serverErrors, setServerErrors, clearServerError } = useServerFieldErrors();

	const form = useForm({
		defaultValues: { reason: "" } satisfies BlockSlotsFormValues,
		validators: { onBlur: blockSlotsFormSchema },
		onSubmit: async ({ value }) => {
			setFormError(null);
			setServerErrors({});

			const result = await blockSlotsAction(doctorId, { ...value, slotIds });
			if (!result.success) {
				if (result.fieldErrors?.reason) setServerErrors(result.fieldErrors);
				else setFormError(result.message);
				return;
			}

			const { cancelledAppointments } = result.data;
			toast.success(
				cancelledAppointments > 0
					? `${result.message} · ${pluralize(cancelledAppointments, "appointment")} cancelled`
					: result.message,
			);
			onDone();
		},
	});

	return (
		<form
			noValidate
			className="space-y-5"
			onSubmit={(event) => {
				event.preventDefault();
				void form.handleSubmit();
			}}
		>
			{formError && (
				<p
					role="alert"
					className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
				>
					{formError}
				</p>
			)}

			<form.Field name="reason">
				{(field) => {
					const error = getClientError(field.state.meta) ?? serverErrors.reason;
					// public slot picker-এও কারণ দেখায় (SDLC 3.9)
					const hint = `Patients can see this. ${field.state.value.length}/200`;
					return (
						<FieldShell id="block-reason" label="Reason" error={error} hint={hint}>
							<Textarea
								{...fieldA11y("block-reason", error, hint)}
								autoFocus
								rows={3}
								placeholder="Doctor is unwell"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => {
									field.handleChange(event.target.value);
									clearServerError("reason");
								}}
							/>
						</FieldShell>
					);
				}}
			</form.Field>

			<DialogFooter>
				<DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button
							type="submit"
							disabled={isSubmitting || slotIds.length === 0}
							className="min-w-28 bg-destructive text-white hover:bg-destructive/90"
						>
							{isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
							Block slots
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}
