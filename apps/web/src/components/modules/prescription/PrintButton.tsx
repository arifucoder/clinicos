"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

// window শুধু browser-এ আছে → শুধু এই ছোট button-টাই client component
export function PrintButton() {
	return (
		<Button type="button" onClick={() => window.print()}>
			<Printer aria-hidden="true" />
			Print
		</Button>
	);
}
