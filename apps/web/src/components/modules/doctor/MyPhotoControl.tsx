"use client";

import { removeMyPhotoAction, uploadMyPhotoAction } from "@/actions/doctor.action";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/types/api.types";
import { PHOTO_MAX_BYTES, PHOTO_TYPES } from "@/zod/doctor.validation";
import { Loader2 } from "lucide-react";
import { type ChangeEvent, useRef, useTransition } from "react";
import { toast } from "sonner";

interface MyPhotoControlProps {
	name: string;
	photoUrl: string | null;
}

export function MyPhotoControl({ name, photoUrl }: MyPhotoControlProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isPending, startTransition] = useTransition();

	const run = (action: () => Promise<ActionResult>) =>
		startTransition(async () => {
			const result = await action();
			if (result.success) toast.success(result.message);
			else toast.error(result.message);
		});

	const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = ""; // একই file আবার বাছলেও onChange চলবে
		if (!file) return;

		if (!PHOTO_TYPES.includes(file.type)) {
			toast.error("Only JPEG, PNG or WebP images are allowed.");
			return;
		}
		if (file.size > PHOTO_MAX_BYTES) {
			toast.error("Photo must be 2 MB or smaller.");
			return;
		}

		const formData = new FormData();
		formData.append("photo", file);
		run(() => uploadMyPhotoAction(formData));
	};

	return (
		<div className="flex flex-col items-center gap-1.5">
			<div className="relative">
				<UserAvatar user={{ name, image: photoUrl }} className="size-20 text-lg" />
				{isPending && (
					<span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
						<Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
						<span className="sr-only">Saving photo…</span>
					</span>
				)}
			</div>

			<input
				ref={inputRef}
				type="file"
				accept={PHOTO_TYPES.join(",")}
				className="sr-only"
				tabIndex={-1}
				aria-hidden="true"
				onChange={handleFile}
			/>

			<div className="flex gap-1">
				<Button type="button" size="sm" variant="ghost" disabled={isPending} onClick={() => inputRef.current?.click()}>
					{photoUrl ? "Change" : "Upload photo"}
				</Button>
				{photoUrl && (
					<Button
						type="button"
						size="sm"
						variant="ghost"
						disabled={isPending}
						className="text-destructive hover:text-destructive"
						onClick={() => run(removeMyPhotoAction)}
					>
						Remove
					</Button>
				)}
			</div>
		</div>
	);
}
