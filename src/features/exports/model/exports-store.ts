import { makeAutoObservable, runInAction } from "mobx";

import {
  exportsApi,
  productExportsApi,
} from "@/features/exports/api/exports-api";
import { ordersApi } from "@/features/orders/api/orders-api";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import {
  type CreateExportResponse,
  type CreateOrderExportPayload,
  type CreateProductExportPayload,
  type ExportJob,
  type ReadyExportFile,
  createPendingExportJob,
  isExportJobTerminal,
} from "./export.types";

const ORDERS_POLL_INTERVAL_MS = 1500;
const PRODUCTS_POLL_INTERVAL_MS = 5000;

type StatusFetcher = (exportId: string) => Promise<ExportJob>;
type DownloadFetcher = (
  exportId: string,
) => Promise<{ downloadUrl: string; fileName: string | null }>;

export class ExportsStore {
  jobsById = new Map<string, ExportJob>();
  createOrdersLoading = false;
  createProductsLoading = false;

  private pollTimersById = new Map<string, number>();

  constructor() {
    makeAutoObservable(this);
  }

  createOrdersExport = async (
    payload: CreateOrderExportPayload,
  ): Promise<CreateExportResponse> => {
    runInAction(() => {
      this.createOrdersLoading = true;
    });

    try {
      const response = await ordersApi.createExport(payload);

      runInAction(() => {
        this.jobsById.set(response.exportId, createPendingExportJob(response));
        this.createOrdersLoading = false;
      });

      return response;
    } catch (error) {
      runInAction(() => {
        this.createOrdersLoading = false;
      });
      throw error instanceof Error
        ? error
        : new Error(unknownErrorMessage(error));
    }
  };

  createProductsExport = async (
    payload: CreateProductExportPayload,
  ): Promise<CreateExportResponse> => {
    runInAction(() => {
      this.createProductsLoading = true;
    });

    try {
      const response = await productExportsApi.create(payload);

      runInAction(() => {
        this.jobsById.set(response.exportId, createPendingExportJob(response));
        this.createProductsLoading = false;
      });

      return response;
    } catch (error) {
      runInAction(() => {
        this.createProductsLoading = false;
      });
      throw error instanceof Error
        ? error
        : new Error(unknownErrorMessage(error));
    }
  };

  awaitReadyFile = async (exportId: string): Promise<ReadyExportFile> =>
    this.awaitReadyFileWith(
      exportId,
      exportsApi.getStatus,
      exportsApi.getDownload,
      ORDERS_POLL_INTERVAL_MS,
    );

  awaitProductReadyFile = async (exportId: string): Promise<ReadyExportFile> =>
    this.awaitReadyFileWith(
      exportId,
      productExportsApi.getStatus,
      productExportsApi.getDownload,
      PRODUCTS_POLL_INTERVAL_MS,
    );

  private awaitReadyFileWith = async (
    exportId: string,
    fetchStatus: StatusFetcher,
    fetchDownload: DownloadFetcher,
    intervalMs: number,
  ): Promise<ReadyExportFile> => {
    const job = await this.awaitTerminal(exportId, fetchStatus, intervalMs);

    if (job.downloadUrl) {
      return {
        exportId: job.exportId,
        downloadUrl: job.downloadUrl,
        fileName: job.fileName,
      };
    }

    const download = await fetchDownload(exportId);

    runInAction(() => {
      const current = this.jobsById.get(exportId);
      if (current) {
        this.jobsById.set(exportId, {
          ...current,
          downloadUrl: download.downloadUrl,
          fileName: download.fileName ?? current.fileName,
        });
      }
    });

    return {
      exportId,
      downloadUrl: download.downloadUrl,
      fileName: download.fileName ?? job.fileName,
    };
  };

  private awaitTerminal = (
    exportId: string,
    fetchStatus: StatusFetcher,
    intervalMs: number,
  ): Promise<ExportJob> =>
    new Promise((resolve, reject) => {
      this.stopPolling(exportId);

      const tick = async (): Promise<void> => {
        try {
          const job = await fetchStatus(exportId);

          runInAction(() => {
            this.jobsById.set(exportId, job);
          });

          if (!isExportJobTerminal(job.status)) {
            return;
          }

          this.stopPolling(exportId);

          if (job.status === "completed") {
            resolve(job);
            return;
          }

          reject(
            new Error(
              job.errorMessage?.trim() ||
                `Export ended with status ${job.status}`,
            ),
          );
        } catch {
          // Keep polling on transient network/API errors.
        }
      };

      void tick();

      const timerId = window.setInterval(() => {
        void tick();
      }, intervalMs);

      this.pollTimersById.set(exportId, timerId);
    });

  stopPolling = (exportId: string): void => {
    const timerId = this.pollTimersById.get(exportId);
    if (timerId != null) {
      window.clearInterval(timerId);
      this.pollTimersById.delete(exportId);
    }
  };

  dispose = (): void => {
    for (const exportId of [...this.pollTimersById.keys()]) {
      this.stopPolling(exportId);
    }
  };
}
