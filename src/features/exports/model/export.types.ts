export const EXPORT_JOB_STATUSES = [
  "pending",
  "processing",
  "completed",
  "failed",
  "expired",
] as const;

export type ExportJobStatus = (typeof EXPORT_JOB_STATUSES)[number];

export type OrderExportMode = "orders" | "order_items";

export type OrderExportFormat = "xlsx" | "csv";

export type OrderExportFilters = {
  keyword?: string;
  statuses?: number[];
  sources?: string[];
  totalPriceFrom?: number;
  totalPriceTo?: number;
  createdFrom?: string;
  createdTo?: string;
  statusId?: number;
  clientId?: number;
};

export type CreateOrderExportPayload = {
  type: OrderExportMode;
  format: OrderExportFormat;
  filters?: OrderExportFilters;
};

export type ProductExportScope = "all" | "filtered";

export type ProductExportFormat = "xlsx" | "csv";

export type ProductExportFieldFilter = {
  fieldId: number;
  mode: "all" | "in" | "contains";
  values?: string[];
};

export type ProductExportFilters = {
  keyword?: string;
  byStatus?: string;
  categoryIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  quantityFrom?: number;
  quantityTo?: number;
  wishlistOnly?: boolean;
  showOnlyReserved?: boolean;
  fieldFilters?: ProductExportFieldFilter[];
};

export type CreateProductExportPayload = {
  scope: ProductExportScope;
  format: ProductExportFormat;
  filters?: ProductExportFilters;
  sort?: string;
};

export type CreateExportResponse = {
  exportId: string;
  status: ExportJobStatus;
};

export type ExportJob = {
  exportId: string;
  status: ExportJobStatus;
  progress: number;
  downloadUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  expiresAt: string | null;
};

export type ExportDownload = {
  downloadUrl: string;
  fileName: string | null;
  expiresInSeconds: number | null;
};

export type ReadyExportFile = {
  exportId: string;
  downloadUrl: string;
  fileName: string | null;
};

export function isExportJobStatus(value: string): value is ExportJobStatus {
  return (EXPORT_JOB_STATUSES as readonly string[]).includes(value);
}

export function isExportJobTerminal(status: ExportJobStatus): boolean {
  return status === "completed" || status === "failed" || status === "expired";
}

export function createPendingExportJob(
  response: CreateExportResponse,
): ExportJob {
  return {
    exportId: response.exportId,
    status: response.status,
    progress: 0,
    downloadUrl: null,
    fileName: null,
    fileSize: null,
    errorMessage: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    expiresAt: null,
  };
}
