"use client";

import { formatDayLabel } from "@/lib/clinicDate";
import { formatCents } from "@/lib/format";
import type { DailyStat } from "@/types/stats.types";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const axisDayFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const axisDay = (day: string) => axisDayFormatter.format(new Date(`${day}T00:00:00Z`));

const compactMoney = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact" });

const COLLECTED = "Collected";

export function DailyChart({ daily }: { daily: DailyStat[] }) {
	return (
		<div className="h-72 w-full">
			<ResponsiveContainer width="100%" height="100%">
				<ComposedChart data={daily} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
					<CartesianGrid vertical={false} stroke="var(--border)" />
					<XAxis
						dataKey="day"
						tickFormatter={axisDay}
						tickLine={false}
						axisLine={false}
						fontSize={12}
						minTickGap={16}
					/>
					<YAxis yAxisId="count" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={32} />
					<YAxis
						yAxisId="money"
						orientation="right"
						tickFormatter={(value: number) => compactMoney.format(value / 100)}
						tickLine={false}
						axisLine={false}
						fontSize={12}
						width={48}
					/>
					<Tooltip
						labelFormatter={(label) => formatDayLabel(String(label))}
						formatter={(value, name) => (name === COLLECTED ? formatCents(Number(value)) : Number(value))}
						contentStyle={{
							background: "var(--popover)",
							border: "1px solid var(--border)",
							borderRadius: 8,
							fontSize: 13,
						}}
						cursor={{ fill: "var(--muted)" }}
					/>
					<Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
					<Bar yAxisId="count" dataKey="total" name="Appointments" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
					<Bar yAxisId="count" dataKey="completed" name="Completed" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
					<Line
						yAxisId="money"
						dataKey="collectedCents"
						name={COLLECTED}
						type="monotone"
						stroke="var(--chart-3)"
						strokeWidth={2}
						dot={false}
					/>
				</ComposedChart>
			</ResponsiveContainer>
		</div>
	);
}
