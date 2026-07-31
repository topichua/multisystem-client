import { DeleteOutlined } from "@ant-design/icons";
import { Button, Checkbox, Flex, Modal, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  getProductListActionTargetKey,
  getProductListActionVariantMeta,
  type ProductListActionTarget,
} from "./product-list-action-target";

const { Text } = Typography;

export type ProductHardDeleteTarget = ProductListActionTarget;

type ProductHardDeleteModalProps = {
  target: ProductHardDeleteTarget | null;
  loading: boolean;
  open: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | Promise<boolean>;
};

export function ProductHardDeleteModal({
  target,
  loading,
  open,
  onCancel,
  onConfirm,
}: ProductHardDeleteModalProps) {
  const targetKey = getProductListActionTargetKey(target);

  return (
    <ProductHardDeleteModalContent
      key={targetKey ?? "empty"}
      target={target}
      loading={loading}
      open={open}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

function ProductHardDeleteModalContent({
  target,
  loading,
  open,
  onCancel,
  onConfirm,
}: ProductHardDeleteModalProps) {
  const { t } = useTranslation();
  const [acknowledged, setAcknowledged] = useState(false);

  const isVariant = target?.type === "variant";
  const variantMeta = getProductListActionVariantMeta(
    target,
    t("products.variant.fallbackName"),
  );

  const title =
    target == null
      ? null
      : isVariant
        ? t("products.hardDelete.variantTitle", {
            name: variantMeta?.title,
          })
        : t("products.hardDelete.productTitle", {
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
      maskClosable={!loading}
      onCancel={onCancel}
      width={400}
      footer={
        <Flex gap={8} justify="flex-end">
          <Button disabled={loading} onClick={onCancel}>
            {t("products.hardDelete.cancel")}
          </Button>
          <Button
            type="primary"
            danger
            disabled={!acknowledged}
            loading={loading}
            icon={<DeleteOutlined />}
            onClick={() => void onConfirm()}
          >
            {t("products.hardDelete.confirm")}
          </Button>
        </Flex>
      }
    >
      <Flex vertical gap={16}>
        {isVariant && target != null && variantMeta != null && (
          <Text type="danger">
            {t("products.hardDelete.variantMeta", {
              productName: target.product.name,
              sku: variantMeta.sku,
            })}
          </Text>
        )}
        <Text type="danger">
          {isVariant
            ? t("products.hardDelete.variantWarning")
            : t("products.hardDelete.productWarning")}
        </Text>
        <Checkbox
          checked={acknowledged}
          disabled={loading}
          onChange={(event) => setAcknowledged(event.target.checked)}
        >
          {t("products.hardDelete.acknowledge")}
        </Checkbox>
      </Flex>
    </Modal>
  );
}
