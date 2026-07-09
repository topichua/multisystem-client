import { PlusIcon } from "@phosphor-icons/react";
import { Button, Popover } from "antd";
import { useTranslation } from "react-i18next";

import type { CatalogVariant } from "@/features/products/model/product.types";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { ProductSearchContent } from "./product-search-content";

type ProductSearchPopoverProps = {
  open: boolean;
  value: string;
  loading: boolean;
  results: CatalogVariant[];
  selectedVariantIds: Set<number>;
  trimmedSearch: string;
  onOpen: () => void;
  onClose: () => void;
  onChange: (value: string) => void;
  onVariantSelect: (variant: CatalogVariant) => void;
};

export function ProductSearchPopover({
  open,
  value,
  loading,
  results,
  selectedVariantIds,
  trimmedSearch,
  onOpen,
  onClose,
  onChange,
  onVariantSelect,
}: ProductSearchPopoverProps) {
  const { t } = useTranslation();
  const isMobileViewport = useIsMobileViewport();

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      onOpen();
      return;
    }

    onClose();
  };

  return (
    <Popover
      open={open}
      trigger="click"
      placement={isMobileViewport ? "bottom" : "bottomRight"}
      arrow={false}
      content={
        <ProductSearchContent
          value={value}
          loading={loading}
          results={results}
          selectedVariantIds={selectedVariantIds}
          trimmedSearch={trimmedSearch}
          onClose={onClose}
          onChange={onChange}
          onVariantSelect={onVariantSelect}
        />
      }
      onOpenChange={handleOpenChange}
    >
      <Button block={isMobileViewport} icon={<PlusIcon size={16} />}>
        {t("orders.create.products.add")}
      </Button>
    </Popover>
  );
}
