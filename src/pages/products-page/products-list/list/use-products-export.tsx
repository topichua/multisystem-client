import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { App, Button } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { ReadyExportFile } from "@/features/exports/model/export.types";
import { useExportsStore } from "@/features/exports/model/use-exports-store";
import { openExportDownload } from "@/features/exports/utils/open-export-download";
import { useProductsStore } from "@/features/products/model/use-products-store";
import { unknownErrorMessage } from "@/utils/unknown-error-message";

import type { ProductsExportFormValues } from "./products-export-modal";

export type ProductsExportController = {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
  submitting: boolean;
  submit: (values: ProductsExportFormValues) => Promise<void>;
};

export function useProductsExport(): ProductsExportController {
  const { t } = useTranslation();
  const { message, notification } = App.useApp();
  const productsStore = useProductsStore();
  const exportsStore = useExportsStore();
  const [open, setOpen] = useState(false);

  const showReadyNotification = (file: ReadyExportFile): void => {
    const key = `products-export-ready-${file.exportId}`;
    const fileName =
      file.fileName ?? t("products.exportModal.readyFallbackName");

    notification.success({
      key,
      title: t("products.exportModal.readyTitle"),
      description: fileName,
      duration: 0,
      closable: false,
      btn: (
        <Button
          type="primary"
          size="small"
          icon={<DownloadSimpleIcon size={14} />}
          data-qa="products-export-download"
          onClick={() => {
            openExportDownload(file.downloadUrl, file.fileName);
            notification.destroy(key);
          }}
        >
          {t("products.exportModal.download")}
        </Button>
      ),
    });
  };

  const submit = async (values: ProductsExportFormValues): Promise<void> => {
    const filters =
      values.scope === "filtered" ? productsStore.listExportFilters : undefined;

    let hidePreparing: (() => void) | null = null;

    try {
      const created = await exportsStore.createProductsExport({
        scope: values.scope,
        format: values.format,
        ...(values.scope === "filtered"
          ? {
              ...(filters && Object.keys(filters).length > 0
                ? { filters }
                : {}),
              sort: productsStore.listSort,
            }
          : {}),
      });

      setOpen(false);
      hidePreparing = message.loading(t("products.exportModal.preparing"), 0);

      const file = await exportsStore.awaitProductReadyFile(created.exportId);

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
    submitting: exportsStore.createProductsLoading,
    submit,
  };
}
