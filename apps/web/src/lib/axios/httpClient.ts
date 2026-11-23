import "server-only";

import { AUTH_COOKIES } from "@/lib/cookieConfig";
import type { ApiResponse } from "@/types/api.types";
import axios, { type AxiosInstance, type AxiosResponse, type Method } from "axios";
import { cookies } from "next/headers";
import { connection } from "next/server";

const REQUEST_TIMEOUT_MS = 15_000;

export interface ApiRequestOptions {
	params?: Record<string, unknown>;
	headers?: Record<string, string>;
	auth?: boolean;
}

export interface ApiResponseWithCookies<TData> {
	data: ApiResponse<TData>;
	setCookies: string[];
}

const getBaseUrl = (): string => {
	const baseURL = process.env.API_BASE_URL;
	if (!baseURL) {
		throw new Error("API_BASE_URL is not defined in environment variables");
	}
	return baseURL;
};

const getAuthCookieHeader = async (): Promise<string | undefined> => {
	const cookieStore = await cookies();

	const pairs = [AUTH_COOKIES.accessToken, AUTH_COOKIES.sessionToken]
		.map((name) => {
			const value = cookieStore.get(name)?.value;
			return value ? `${name}=${value}` : null;
		})
		.filter((pair): pair is string => pair !== null);

	return pairs.length > 0 ? pairs.join("; ") : undefined;
};

const createInstance = async (auth: boolean): Promise<AxiosInstance> => {
	let cookieHeader: string | undefined;

	if (auth) {
		await connection();
		cookieHeader = await getAuthCookieHeader();
	}

	return axios.create({
		baseURL: getBaseUrl(),
		timeout: REQUEST_TIMEOUT_MS,
		headers: {
			"Content-Type": "application/json",
			...(cookieHeader && { Cookie: cookieHeader }),
		},
	});
};

const logRequestError = (method: Method, endpoint: string, error: unknown) => {
	if (axios.isAxiosError(error)) {
		console.error(`[httpClient] ${method} ${endpoint} failed`, {
			status: error.response?.status,
			code: error.code,
		});
		return;
	}
	console.error(`[httpClient] ${method} ${endpoint} failed`, error instanceof Error ? error.message : error);
};

const send = async <TData>(
	method: Method,
	endpoint: string,
	data?: unknown,
	options?: ApiRequestOptions,
): Promise<AxiosResponse<ApiResponse<TData>>> => {
	try {
		const instance = await createInstance(options?.auth ?? true);
		return await instance.request<ApiResponse<TData>>({
			method,
			url: endpoint,
			data,
			params: options?.params,
			headers: options?.headers, // এখানে Cookie দিলে (যেমন logout) উপরেরটার বদলে এটা যায়
		});
	} catch (error) {
		logRequestError(method, endpoint, error);
		throw error;
	}
};

const request = async <TData>(
	method: Method,
	endpoint: string,
	data?: unknown,
	options?: ApiRequestOptions,
): Promise<ApiResponse<TData>> => {
	const response = await send<TData>(method, endpoint, data, options);
	return response.data;
};

const requestWithCookies = async <TData>(
	method: Method,
	endpoint: string,
	data?: unknown,
	options?: ApiRequestOptions,
): Promise<ApiResponseWithCookies<TData>> => {
	const response = await send<TData>(method, endpoint, data, options);
	const setCookie = response.headers["set-cookie"];

	return {
		data: response.data,
		setCookies: Array.isArray(setCookie) ? setCookie : [],
	};
};

export const httpClient = {
	get: <TData>(endpoint: string, options?: ApiRequestOptions) => request<TData>("GET", endpoint, undefined, options),

	post: <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions) =>
		request<TData>("POST", endpoint, data, options),

	put: <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions) =>
		request<TData>("PUT", endpoint, data, options),

	patch: <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions) =>
		request<TData>("PATCH", endpoint, data, options),

	delete: <TData>(endpoint: string, options?: ApiRequestOptions) =>
		request<TData>("DELETE", endpoint, undefined, options),

	postWithCookies: <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions) =>
		requestWithCookies<TData>("POST", endpoint, data, options),
};
