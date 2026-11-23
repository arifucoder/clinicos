export interface ApiErrorSource {
	path: string;
	message: string;
}

export interface ApiResponse<TData> {
	success: true;
	message: string;
	data: TData;
	meta?: { page: number; limit: number; total: number; totalPages: number };
}

export interface ApiErrorResponse {
	success: false;
	message: string;
	errorSources: ApiErrorSource[];
}

export interface ActionError {
	success: false;
	message: string;
	fieldErrors?: Record<string, string>;
	code?: "EMAIL_NOT_VERIFIED" | "TOO_MANY_ATTEMPTS" | "SLOT_TAKEN" | "PROFILE_INCOMPLETE";
}

export type ActionResult<TData = null> = { success: true; message: string; data: TData } | ActionError;

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface ApiResponse<TData> {
	success: true;
	message: string;
	data: TData;
	meta?: PaginationMeta;
}
