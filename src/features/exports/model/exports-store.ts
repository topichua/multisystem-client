import { makeAutoObservable, runInAction } from "mobx";

import { exportsApi } from "@/features/exports/api/exports-api";
import { ordersApi } from "@/features/orders/api/orders-api";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import {
  type CreateExportResponse,
  type CreateOrderExportPayload,
  type ExportJob,
  type ReadyExportFile,
  createPendingExportJob,
  isExportJobTerminal,
} from "./export.types";

const DEFAULT_POLL_INTERVAL_MS = 1500;

export class ExportsStore {
  jobsById = new Map<string, ExportJob>();
  createOrdersLoading = false;

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

  /** Polls until completed/failed, then resolves a downloadable URL. */
  awaitReadyFile = async (exportId: string): Promise<ReadyExportFile> => {
    const job = await this.awaitTerminal(exportId);

    if (job.downloadUrl) {
      return {
        exportId: job.exportId,
        downloadUrl: job.downloadUrl,
        fileName: job.fileName,
      };
    }

    const download = await exportsApi.getDownload(exportId);

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

  private awaitTerminal = (exportId: string): Promise<ExportJob> =>
    new Promise((resolve, reject) => {
      this.stopPolling(exportId);

      const tick = async (): Promise<void> => {
        try {
          const job = await exportsApi.getStatus(exportId);

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
      }, DEFAULT_POLL_INTERVAL_MS);

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
