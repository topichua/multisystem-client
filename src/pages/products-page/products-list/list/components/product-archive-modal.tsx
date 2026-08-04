import { ArchiveIcon } from "@phosphor-icons/react";
import { Button, Flex, Modal, Typography } from "antd";
import { useTranslation } from "react-i18next";

import {
  getProductListActionVariantMeta,
  type ProductListActionTarget,
} from "./product-list-action-target";

const { Text } = Typography;

export type ProductArchiveTarget = ProductListActionTarget;

type ProductArchiveModalProps = {
  target: ProductArchiveTarget | null;
  loading: boolean;
  open: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | Promise<boolean>;
};

export function ProductArchiveModal({
  target,
  loading,
  open,
  onCancel,
  onConfirm,
}: ProductArchiveModalProps) {
  const { t } = useTranslation();
  const isVariant = target?.type === "variant";
  const variantMeta = getProductListActionVariantMeta(
    target,
    t("products.variant.fallbackName"),
  );

  const title =
    target == null
      ? null
      : isVariant
        ? t("products.archiveModal.variantTitle", {
            name: variantMeta?.title,
          })
        : t("products.archiveModal.productTitle", {
            name: target.product.name,
          });

  return (
    <Modal
      destroyOnHidden
      centered
      open={open}
      title={title}
      closable={!loading}
      keyboard={!loading}
      mask={{ closable: !loading }}
      onCancel={onCancel}
      width={400}
      footer={
        <Flex gap={8} justify="flex-end">
          <Button disabled={loading} onClick={onCancel}>
            {t("products.archiveModal.cancel")}
          </Button>
          <Button
            type="primary"
            loading={loading}
            icon={<ArchiveIcon size={16} />}
            onClick={() => void onConfirm()}
          >
            {isVariant
              ? t("products.archiveModal.confirmVariant")
              : t("products.archiveModal.confirmProduct")}
          </Button>
        </Flex>
      }
    >
      <Flex vertical gap={12}>
        {isVariant && target != null && variantMeta != null && (
          <Text type="secondary">
            {t("products.archiveModal.variantMeta", {
              productName: target.product.name,
              sku: variantMeta.sku,
            })}
          </Text>
        )}
        <Text>
          {isVariant
            ? t("products.archiveModal.variantDescription")
            : t("products.archiveModal.productDescription")}
        </Text>
      </Flex>
    </Modal>
  );
}
