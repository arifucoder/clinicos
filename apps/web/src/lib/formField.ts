import type { AnyFieldMeta } from "@tanstack/react-form";

// TanStack Form-এর error (string অথবা Zod issue) → প্রথম message; touch না হলে কিছু না
export const getClientError = (meta: AnyFieldMeta): string | undefined => {
	if (!meta.isTouched) return undefined;
	const first = meta.errors[0];
	return typeof first === "string" ? first : first?.message;
};

// input-এ ছড়িয়ে দাও: <Input {...fieldA11y("admin-name", error)} />
// FieldShell-এর message <p>-এর id-র সাথে মেলে
export const fieldA11y = (id: string, error?: string, hint?: string) => ({
	id,
	"aria-invalid": !!error,
	"aria-describedby": error || hint ? `${id}-message` : undefined,
});
