import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { App, Button } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { ReadyExportFile } from "@/features/exports/model/export.types";
import { useExportsStore } from "@/features/exports/model/use-exports-store";
import { openExportDownload } from "@/features/exports/utils/open-export-download";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import type { OrdersExportFormValues } from "./orders-export-modal";

export type OrdersExportController = {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
  submitting: boolean;
  submit: (values: OrdersExportFormValues) => Promise<void>;
};

export function useOrdersExport(): OrdersExportController {
  const { t } = useTranslation();
  const { message, notification } = App.useApp();
  const ordersStore = useOrdersStore();
  const exportsStore = useExportsStore();
  const [open, setOpen] = useState(false);

  const showReadyNotification = (file: ReadyExportFile): void => {
    const key = `orders-export-ready-${file.exportId}`;
    const fileName = file.fileName ?? t("orders.exportModal.readyFallbackName");

    notification.open({
      key,
      title: t("orders.exportModal.readyTitle"),
      description: fileName,
      duration: 0,
      closable: false,
      btn: (
        <Button
          type="primary"
          size="small"
          icon={<DownloadSimpleIcon size={14} />}
          data-qa="orders-export-download"
          onClick={() => {
            openExportDownload(file.downloadUrl, file.fileName);
            notification.destroy(key);
          }}
        >
          {t("orders.exportModal.download")}
        </Button>
      ),
    });
  };

  const submit = async (values: OrdersExportFormValues): Promise<void> => {
    const filters =
      values.scope === "filtered" ? ordersStore.listExportFilters : undefined;

    let hidePreparing: (() => void) | null = null;

    try {
      const created = await exportsStore.createOrdersExport({
        type: values.includeLineDetails ? "order_items" : "orders",
        format: values.format,
        ...(filters && Object.keys(filters).length > 0 ? { filters } : {}),
      });

      setOpen(false);
      hidePreparing = message.loading(t("orders.exportModal.preparing"), 0);

      const file = await exportsStore.awaitReadyFile(created.exportId);

      hidePreparing();
      hidePreparing = null;
      showReadyNotification(file);
    } catch (error) {
      hidePreparing?.();
      message.error(unknownErrorMessage(error));
    }
  };

  return {
    open,
    openModal: () => setOpen(true),
    closeModal: () => setOpen(false),
    submitting: exportsStore.createOrdersLoading,
    submit,
  };
}
