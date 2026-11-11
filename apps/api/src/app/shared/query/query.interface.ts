export type TSortOrder = "asc" | "desc";

export type TFilterType = "string" | "number" | "boolean" | "enum" | "uuid";

export type TFilterOperator = "equals" | "contains" | "in" | "gte" | "lte";

export type TFilterDef = {
	path: string;
	type: TFilterType;
	op?: TFilterOperator;
	values?: readonly string[];
};

export type TListConfig = {
	searchableFields?: readonly string[];
	filters?: Readonly<Record<string, TFilterDef>>;
	sortableFields: readonly string[];
	defaultSortBy: string;
	defaultSortOrder?: TSortOrder;
	defaultLimit?: number;
	maxLimit?: number;
};

export type TCompiledFilter = TFilterDef & {
	key: string;
	parts: readonly string[];
	op: TFilterOperator;
	allowed?: ReadonlySet<string>;
};

export type TCompiledListConfig<TWhere, TOrderBy> = {
	searchPaths: readonly (readonly string[])[];
	filters: readonly TCompiledFilter[];
	sortable: ReadonlyMap<string, readonly string[]>;
	defaultSortBy: string;
	defaultSortOrder: TSortOrder;
	defaultLimit: number;
	maxLimit: number;
	readonly __types?: { where: TWhere; orderBy: TOrderBy };
};

export type TListQuery<TWhere, TOrderBy> = {
	where: TWhere;
	args: { where: TWhere; orderBy: TOrderBy[]; skip: number; take: number };
	page: number;
	limit: number;
};
