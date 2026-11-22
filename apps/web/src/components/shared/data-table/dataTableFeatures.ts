import { rowSortingFeature, tableFeatures } from "@tanstack/react-table";

// v9: শুধু যে feature লাগবে সেটাই নাও। sort api করে, তাই sortedRowModel লাগে না।
// pagination-ও api-র meta থেকে আসে, তাই rowPaginationFeature লাগে না।
// module scope-এ রাখা হয়েছে, যাতে প্রতিবার render-এ নতুন object না হয় (v9-এর নিয়ম)।
export const dataTableFeatures = tableFeatures({ rowSortingFeature });

export type DataTableFeatures = typeof dataTableFeatures;
