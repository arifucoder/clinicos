"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { SpecialtyFormDialog } from "./SpecialtyFormDialog";

// header (server component)-এ বসে, তাই dialog-এর state নিজের ভেতরে
export function NewSpecialtyButton() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)} className="h-10 px-4">
				<Plus aria-hidden="true" />
				New specialty
			</Button>
			<SpecialtyFormDialog open={open} onOpenChange={setOpen} />
		</>
	);
}
