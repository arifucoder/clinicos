"use client";

import { Button } from "@/components/ui/button";
import type { SpecialtyRef } from "@/types/doctor.types";
import { Plus } from "lucide-react";
import { useState } from "react";
import { DoctorFormDialog } from "./DoctorFormDialog";

export function NewDoctorButton({ specialties }: { specialties: SpecialtyRef[] }) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)} className="h-10 px-4">
				<Plus aria-hidden="true" />
				New doctor
			</Button>
			<DoctorFormDialog open={open} onOpenChange={setOpen} specialties={specialties} />
		</>
	);
}
