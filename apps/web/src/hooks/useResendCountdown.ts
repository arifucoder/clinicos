import { useCallback, useEffect, useState } from "react";

export function useResendCountdown(initialSeconds = 60) {
	const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

	useEffect(() => {
		if (secondsLeft <= 0) return;
		const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
		return () => clearTimeout(timer);
	}, [secondsLeft]);

	const restart = useCallback(() => setSecondsLeft(initialSeconds), [initialSeconds]);
	const finish = useCallback(() => setSecondsLeft(0), []);

	return {
		secondsLeft,
		canResend: secondsLeft <= 0,
		label: `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`,
		restart,
		finish,
	};
}
