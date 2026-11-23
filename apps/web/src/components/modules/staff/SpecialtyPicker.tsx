"use client";

import { Label } from "@/components/ui/label";
import type { SpecialtyRef } from "@/types/doctor.types";
import { Combobox } from "@base-ui/react/combobox";
import { cn } from "cn";
import { CheckIcon, ChevronDown, XIcon } from "lucide-react";
import { useRef } from "react";

interface SpecialtyPickerProps {
	id: string;
	options: SpecialtyRef[];
	value: string[];
	max: number;
	error?: string;
	onChange: (next: string[]) => void;
	onBlur: () => void;
}

export function SpecialtyPicker({ id, options, value, max, error, onChange, onBlur }: SpecialtyPickerProps) {
	const anchorRef = useRef<HTMLDivElement>(null);
	const selected = options.filter((option) => value.includes(option.id));
	const atLimit = value.length >= max;
	const messageId = `${id}-message`;

	return (
		<div className="space-y-2">
			<Label htmlFor={id} className="text-[13px]">
				Specialties
			</Label>

			<Combobox.Root
				items={options}
				multiple
				value={selected}
				onValueChange={(next) => onChange(next.map((specialty) => specialty.id))}
				itemToStringLabel={(specialty) => specialty.name}
				isItemEqualToValue={(item, current) => item.id === current.id}
			>
				<Combobox.Chips
					ref={anchorRef}
					className={cn(
						"flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border bg-transparent px-2 py-1.5 text-sm shadow-xs transition-shadow focus-within:ring-3 focus-within:ring-ring/50",
						error ? "border-destructive" : "border-input focus-within:border-ring",
					)}
				>
					{selected.map((specialty) => (
						<Combobox.Chip
							key={specialty.id}
							aria-label={specialty.name}
							className="flex items-center gap-1 rounded-md bg-primary-soft py-0.5 pr-1 pl-2 text-xs font-medium text-primary-hover"
						>
							{specialty.name}
							<Combobox.ChipRemove
								aria-label={`Remove ${specialty.name}`}
								className="rounded p-0.5 hover:bg-primary/10"
							>
								<XIcon className="size-3" />
							</Combobox.ChipRemove>
						</Combobox.Chip>
					))}
					<Combobox.Input
						id={id}
						onBlur={onBlur}
						aria-invalid={!!error}
						aria-describedby={messageId}
						placeholder={selected.length > 0 ? "" : "Search specialties…"}
						className="h-7 min-w-24 flex-1 bg-transparent px-1 outline-none placeholder:text-muted-foreground"
					/>
					<Combobox.Trigger aria-label="Show specialties" className="rounded p-1 text-muted-foreground">
						<ChevronDown className="size-4" />
					</Combobox.Trigger>
				</Combobox.Chips>

				<Combobox.Portal>
					<Combobox.Positioner anchor={anchorRef} sideOffset={4} className="isolate z-50 outline-none">
						<Combobox.Popup className="max-h-[min(var(--available-height),16rem)] w-(--anchor-width) overflow-y-auto rounded-md bg-popover p-1 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10">
							<Combobox.Empty className="px-2 py-3 text-center text-muted-foreground empty:hidden">
								No specialty matches.
							</Combobox.Empty>
							<Combobox.List>
								{(specialty: SpecialtyRef) => {
									const isSelected = value.includes(specialty.id);
									return (
										<Combobox.Item
											key={specialty.id}
											value={specialty}
											disabled={atLimit && !isSelected}
											className="flex cursor-default items-center gap-2 rounded px-2 py-1.5 outline-none select-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground"
										>
											<span className="flex size-4 items-center justify-center">
												<Combobox.ItemIndicator>
													<CheckIcon className="size-4 text-primary" />
												</Combobox.ItemIndicator>
											</span>
											{specialty.name}
										</Combobox.Item>
									);
								}}
							</Combobox.List>
						</Combobox.Popup>
					</Combobox.Positioner>
				</Combobox.Portal>
			</Combobox.Root>

			<p id={messageId} className={error ? "text-sm text-destructive" : "text-xs text-muted-foreground"}>
				{error ??
					(options.length === 0
						? "No active specialties. Add one on the Specialties page first."
						: `Pick 1 to ${max}. ${value.length} selected.`)}
			</p>
		</div>
	);
}
