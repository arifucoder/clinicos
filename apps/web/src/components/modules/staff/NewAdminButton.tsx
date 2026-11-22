"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AdminFormDialog } from "./AdminFormDialog";

export function NewAdminButton() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)} className="h-10 px-4">
				<Plus aria-hidden="true" />
				New admin
			</Button>
			<AdminFormDialog open={open} onOpenChange={setOpen} />
		</>
	);
}
