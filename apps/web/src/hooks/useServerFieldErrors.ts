"use client";

import { useCallback, useState } from "react";

// action-এর fieldErrors (যেমন 409 → email) রাখে; user সেই field-এ লিখলেই মুছে যায়
export function useServerFieldErrors() {
	const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

	const clearServerError = useCallback(
		(name: string) =>
			setServerErrors((previous) => {
				if (!(name in previous)) return previous;
				const next = { ...previous };
				delete next[name];
				return next;
			}),
		[],
	);

	return { serverErrors, setServerErrors, clearServerError };
}
