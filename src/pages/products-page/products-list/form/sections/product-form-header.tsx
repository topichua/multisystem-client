import { ArchiveIcon, TrashIcon } from "@phosphor-icons/react";
import { Button, Flex, Typography } from "antd";
import { useTranslation } from "react-i18next";

import AIAssistanceIcon from "@/components/icons/ai-assistance/AIAssistance.svg?react";

import { AiButton } from "../product-form.styled";

const { Title, Text } = Typography;

export type ProductFormHeaderProps = {
  title: string;
  subtitle: string;
  onInstagramAiClick: () => void;
  isMobile?: boolean;
  isEditMode?: boolean;
  archiveLoading?: boolean;
  deleteLoading?: boolean;
  onArchiveProduct?: () => void;
  onDeleteProduct?: () => void;
};

type ProductLifecycleActionsProps = {
  gap: number;
  archiveLoading: boolean;
  deleteLoading: boolean;
  onArchiveProduct: () => void;
  onDeleteProduct: () => void;
  showDataQa?: boolean;
};

function ProductLifecycleActions({
  gap,
  archiveLoading,
  deleteLoading,
  onArchiveProduct,
  onDeleteProduct,
  showDataQa = false,
}: ProductLifecycleActionsProps) {
  const { t } = useTranslation();

  return (
    <Flex gap={gap} wrap="wrap">
      <Button
        type="text"
        htmlType="button"
        icon={<ArchiveIcon size={16} />}
        loading={archiveLoading}
        data-qa={showDataQa ? "products-edit-archive" : undefined}
        onClick={onArchiveProduct}
      >
        {t("products.editPage.archiveProduct")}
      </Button>
      <Button
        type="text"
        htmlType="button"
        icon={<TrashIcon size={16} />}
        loading={deleteLoading}
        data-qa={showDataQa ? "products-edit-delete" : undefined}
        onClick={onDeleteProduct}
      >
        {t("products.editPage.deleteProduct")}
      </Button>
    </Flex>
  );
}

export const ProductFormHeader = ({
  title,
  subtitle,
  onInstagramAiClick,
  isMobile = false,
  isEditMode = false,
  archiveLoading = false,
  deleteLoading = false,
  onArchiveProduct,
  onDeleteProduct,
}: ProductFormHeaderProps) => {
  const { t } = useTranslation();
  const showLifecycleActions =
    isEditMode && onArchiveProduct != null && onDeleteProduct != null;

  if (isMobile) {
    return (
      <Flex vertical gap={8}>
        <AiButton
          $filled
          block
          htmlType="button"
          icon={<AIAssistanceIcon />}
          aria-label={t("products.instagram.ai.addWithInstagramButton")}
          data-qa="products-mobile-form-ai"
          onClick={onInstagramAiClick}
        >
          {t("products.instagram.ai.addWithInstagramButton")}
        </AiButton>
        {showLifecycleActions && (
          <ProductLifecycleActions
            gap={8}
            archiveLoading={archiveLoading}
            deleteLoading={deleteLoading}
            onArchiveProduct={onArchiveProduct}
            onDeleteProduct={onDeleteProduct}
          />
        )}
      </Flex>
    );
  }

  return (
    <Flex justify="space-between" align="flex-start" gap={24}>
      <Flex vertical gap={12}>
        <Flex vertical gap={4}>
          <Title level={2} style={{ margin: 0 }}>
            {title}
          </Title>
          <Text type="secondary">{subtitle}</Text>
        </Flex>

        {showLifecycleActions && (
          <ProductLifecycleActions
            gap={24}
            archiveLoading={archiveLoading}
            deleteLoading={deleteLoading}
            onArchiveProduct={onArchiveProduct}
            onDeleteProduct={onDeleteProduct}
            showDataQa
          />
        )}
      </Flex>

      <AiButton
        $filled
        htmlType="button"
        icon={<AIAssistanceIcon />}
        onClick={onInstagramAiClick}
      >
        {t("products.instagram.ai.addWithInstagramButton")}
      </AiButton>
    </Flex>
  );
};
