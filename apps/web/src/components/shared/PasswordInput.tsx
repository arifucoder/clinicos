"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { type ComponentProps, useState } from "react";

type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type">;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
	const [visible, setVisible] = useState(false);

	return (
		<div className="relative">
			{/* pr-11 শেষে: নাহলে বাইরে থেকে আসা px-* এটাকে মুছে দিত */}
			<Input type={visible ? "text" : "password"} className={cn(className, "pr-11")} {...props} />
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground"
				onClick={() => setVisible((v) => !v)}
				aria-label={visible ? "Hide password" : "Show password"}
				aria-pressed={visible}
			>
				{visible ? <EyeOff /> : <Eye />}
			</Button>
		</div>
	);
}
