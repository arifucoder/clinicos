const UNIT_MS = {
	ms: 1,
	s: 1000,
	m: 60_000,
	h: 3_600_000,
	d: 86_400_000,
	w: 604_800_000,
	y: 31_557_600_000,
} as const;

type TDurationUnit = keyof typeof UNIT_MS;

const isDurationUnit = (unit: string): unit is TDurationUnit => {
	return Object.hasOwn(UNIT_MS, unit);
};

export const durationToMs = (duration: string): number => {
	const match = /^(\d+(?:\.\d+)?)\s?(ms|s|m|h|d|w|y)$/i.exec(duration);
	const value = Number(match?.[1]);
	const unit = match?.[2]?.toLowerCase();

	if (!unit || !isDurationUnit(unit) || Number.isNaN(value)) {
		throw new Error(`Invalid duration: ${duration}`);
	}

	return Math.round(value * UNIT_MS[unit]);
};

export const durationToSeconds = (duration: string): number => {
	return Math.floor(durationToMs(duration) / 1000);
};
