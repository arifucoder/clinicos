import { AppError } from "@/app/errorHelpers/AppError";
import type { TMeta } from "@/app/shared/sendResponse";
import httpStatus from "http-status";
import * as z from "zod";
import type {
	TCompiledFilter,
	TCompiledListConfig,
	TFilterDef,
	TListConfig,
	TListQuery,
	TSortOrder,
} from "./query.interface";

type AnyObject = Record<string, unknown>;

const MAX_IN_VALUES = 50;

const baseQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).optional(),
	sortBy: z.string().trim().optional(),
	sortOrder: z.enum(["asc", "desc"]).optional(),
	searchTerm: z.string().trim().max(100).optional(),
});

const uuidSchema = z.uuid();

const badRequest = (message: string) => new AppError(httpStatus.BAD_REQUEST, message);

const nest = (parts: readonly string[], leaf: unknown): AnyObject => {
	const lastKey = parts.at(-1) ?? "";
	return parts.slice(0, -1).reduceRight<AnyObject>((node, key) => ({ [key]: node }), { [lastKey]: leaf });
};

const isPlainObject = (value: unknown): value is AnyObject =>
	typeof value === "object" && value !== null && !Array.isArray(value);

const splitPath = (path: string): string[] => {
	const parts = path.split(".");
	if (parts.some((part) => part.trim() === "")) throw new Error(`Invalid path "${path}"`);
	return parts;
};

export const defineListConfig = <TWhere, TOrderBy>(config: TListConfig): TCompiledListConfig<TWhere, TOrderBy> => {
	const sortable = new Map(config.sortableFields.map((field) => [field, splitPath(field)] as const));

	if (!sortable.has(config.defaultSortBy)) {
		throw new Error(`defaultSortBy "${config.defaultSortBy}" must be in sortableFields`);
	}

	const filters = Object.entries(config.filters ?? {}).map(([key, def]): TCompiledFilter => {
		const op = def.op ?? "equals";

		if (def.type === "enum" && !def.values?.length) {
			throw new Error(`Filter "${key}": enum type needs "values"`);
		}
		if (op === "contains" && def.type !== "string") {
			throw new Error(`Filter "${key}": "contains" works only with string type`);
		}

		return {
			...def,
			key,
			op,
			parts: splitPath(def.path),
			...(def.values ? { allowed: new Set(def.values) } : {}),
		};
	});

	return {
		searchPaths: (config.searchableFields ?? []).map(splitPath),
		filters,
		sortable,
		defaultSortBy: config.defaultSortBy,
		defaultSortOrder: config.defaultSortOrder ?? "desc",
		defaultLimit: config.defaultLimit ?? 10,
		maxLimit: config.maxLimit ?? 100,
	};
};

const parseScalar = (raw: string, filter: TFilterDef & { key: string; allowed?: ReadonlySet<string> }): unknown => {
	const value = raw.trim();

	switch (filter.type) {
		case "string":
			return value;

		case "number": {
			const num = Number(value);
			if (value === "" || !Number.isFinite(num)) throw badRequest(`"${filter.key}" must be a number`);
			return num;
		}

		case "boolean":
			if (value === "true") return true;
			if (value === "false") return false;
			throw badRequest(`"${filter.key}" must be true or false`);

		case "enum": {
			const upper = value.toUpperCase();
			if (!filter.allowed?.has(upper)) {
				throw badRequest(`"${filter.key}" must be one of: ${[...(filter.allowed ?? [])].join(", ")}`);
			}
			return upper;
		}

		case "uuid":
			if (!uuidSchema.safeParse(value).success) throw badRequest(`"${filter.key}" must be a valid id`);
			return value;

		default: {
			const unhandled: never = filter.type;
			throw new Error(`Unhandled filter type: ${String(unhandled)}`);
		}
	}
};

const buildFilterCondition = (raw: unknown, filter: TCompiledFilter): AnyObject | undefined => {
	if (raw === undefined || raw === "") return undefined;

	if (filter.op === "in") {
		const list = (Array.isArray(raw) ? raw : [raw])
			.flatMap((item) => (typeof item === "string" ? item.split(",") : []))
			.filter((item) => item.trim() !== "");

		if (list.length === 0) return undefined;
		if (list.length > MAX_IN_VALUES) throw badRequest(`"${filter.key}" accepts at most ${MAX_IN_VALUES} values`);

		return nest(filter.parts, { in: list.map((item) => parseScalar(item, filter)) });
	}

	if (typeof raw !== "string") throw badRequest(`"${filter.key}" must be a single value`);

	const value = parseScalar(raw, filter);

	switch (filter.op) {
		case "contains":
			return nest(filter.parts, { contains: value, mode: "insensitive" });
		case "gte":
			return nest(filter.parts, { gte: value });
		case "lte":
			return nest(filter.parts, { lte: value });
		default:
			return nest(filter.parts, value);
	}
};

export const buildListQuery = <TWhere, TOrderBy>(
	rawQuery: unknown,
	config: TCompiledListConfig<TWhere, TOrderBy>,
	baseWhere?: TWhere,
): TListQuery<TWhere, TOrderBy> => {
	const query: AnyObject = isPlainObject(rawQuery) ? rawQuery : {};
	const base = baseQuerySchema.parse(query);

	const conditions: unknown[] = [];
	if (baseWhere) conditions.push(baseWhere);

	if (base.searchTerm && config.searchPaths.length > 0) {
		const leaf = { contains: base.searchTerm, mode: "insensitive" };
		conditions.push({ OR: config.searchPaths.map((parts) => nest(parts, leaf)) });
	}

	for (const filter of config.filters) {
		const condition = buildFilterCondition(query[filter.key], filter);
		if (condition) conditions.push(condition);
	}

	const sortBy = base.sortBy || config.defaultSortBy;
	const sortParts = config.sortable.get(sortBy);
	if (!sortParts) {
		throw badRequest(`Cannot sort by "${sortBy}". Allowed: ${[...config.sortable.keys()].join(", ")}`);
	}
	const sortOrder: TSortOrder = base.sortOrder ?? config.defaultSortOrder;
	const orderBy = [nest(sortParts, sortOrder)];
	if (sortBy !== "id") orderBy.push({ id: sortOrder });

	const page = base.page;
	const limit = Math.min(base.limit ?? config.defaultLimit, config.maxLimit);

	const whereObject = conditions.length === 0 ? {} : conditions.length === 1 ? conditions[0] : { AND: conditions };

	// oxlint-disable-next-line typescript/no-unsafe-type-assertion
	const where = whereObject as TWhere;
	// oxlint-disable-next-line typescript/no-unsafe-type-assertion
	const typedOrderBy = orderBy as TOrderBy[];

	return {
		where,
		args: { where, orderBy: typedOrderBy, skip: (page - 1) * limit, take: limit },
		page,
		limit,
	};
};

export const buildMeta = (total: number, page: number, limit: number): TMeta => ({
	page,
	limit,
	total,
	totalPages: Math.ceil(total / limit),
});
