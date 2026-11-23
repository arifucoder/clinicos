"use client";

import { useCallback, useState } from "react";

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
