import type { AnyFieldMeta } from "@tanstack/react-form";

export const getClientError = (meta: AnyFieldMeta): string | undefined => {
	if (!meta.isTouched) return undefined;
	const first = meta.errors[0];
	return typeof first === "string" ? first : first?.message;
};

export const fieldA11y = (id: string, error?: string, hint?: string) => ({
	id,
	"aria-invalid": !!error,
	"aria-describedby": error || hint ? `${id}-message` : undefined,
});
