"use client";

import { Input } from "@/components/ui/input";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DataTableSearchProps {
	placeholder: string;
	paramKey?: string;
	className?: string;
	inputClassName?: string;
}

export function DataTableSearch({
	placeholder,
	paramKey = "searchTerm",
	className,
	inputClassName,
}: DataTableSearchProps) {
	const { searchParams, setParams } = useTableUrlState();
	const [value, setValue] = useState(searchParams.get(paramKey) ?? "");
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	useEffect(() => () => clearTimeout(timer.current), []);

	return (
		<div className={cn("relative w-full sm:w-72", className)}>
			<Search
				className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
				aria-hidden="true"
			/>
			<Input
				type="search"
				aria-label={placeholder}
				placeholder={placeholder}
				value={value}
				onChange={(event) => {
					const next = event.target.value;
					setValue(next);
					clearTimeout(timer.current);
					timer.current = setTimeout(() => setParams({ [paramKey]: next.trim() || null }, { resetPage: true }), 300);
				}}
				className={cn("h-9 bg-card pl-9", inputClassName)}
			/>
		</div>
	);
}
