"use client";

import { Input } from "@/components/ui/input";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DataTableSearchProps {
	placeholder: string;
	paramKey?: string;
}

export function DataTableSearch({ placeholder, paramKey = "searchTerm" }: DataTableSearchProps) {
	const { searchParams, setParams } = useTableUrlState();
	const [value, setValue] = useState(searchParams.get(paramKey) ?? "");
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	// component চলে গেলে বাকি থাকা timer বাতিল
	useEffect(() => () => clearTimeout(timer.current), []);

	return (
		<div className="relative w-full sm:w-72">
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
					// debounce: থামার 300ms পরে একবার URL বদলাও (প্রতি অক্ষরে api call না)
					clearTimeout(timer.current);
					timer.current = setTimeout(() => setParams({ [paramKey]: next.trim() || null }, { resetPage: true }), 300);
				}}
				className="h-9 bg-card pl-9"
			/>
		</div>
	);
}
