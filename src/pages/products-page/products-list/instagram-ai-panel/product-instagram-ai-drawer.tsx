import { Drawer, Flex, Typography } from "antd";
import { Tag } from "@/components/tag/tag";
import { SparkleIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

import { InstagramLogoIcon } from "@/components/icons/instagram/instagram-logo-icon";
import { ProductInstagramAiDrawerContent } from "./product-instagram-ai-drawer-content";
import type {
  ProductInstagramAiCategoryOption,
  ProductInstagramAiFillHandler,
} from "./product-instagram-ai.types";

const { Text, Title } = Typography;

export type ProductInstagramAiDrawerProps = {
  open: boolean;
  onClose: () => void;
  categoryOptions: readonly ProductInstagramAiCategoryOption[];
  onFillProductForm?: ProductInstagramAiFillHandler;
  isMobile?: boolean;
};

export const ProductInstagramAiDrawer = ({
  open,
  onClose,
  categoryOptions,
  onFillProductForm,
  isMobile = false,
}: ProductInstagramAiDrawerProps) => {
  const { t } = useTranslation();

  return (
    <Drawer
      closable={{ placement: "end" }}
      title={
        <Flex align="center" gap={12}>
          <InstagramLogoIcon size={isMobile ? 28 : 34} />
          <Flex vertical>
            <Flex align="center" gap={8} wrap="wrap">
              <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>
                {t("products.instagram.ai.drawerTitle")}
              </Title>
              <Tag color="purple" icon={<SparkleIcon size={14} />}>
                {t("products.instagram.ai.tag")}
              </Tag>
            </Flex>
            <Text type="secondary">
              {t("products.instagram.ai.drawerSubtitle")}
            </Text>
          </Flex>
        </Flex>
      }
      open={open}
      onClose={onClose}
      placement={isMobile ? "bottom" : "right"}
      size={isMobile ? undefined : 960}
      height={isMobile ? "100dvh" : undefined}
      destroyOnHidden
      styles={{
        body: {
          padding: isMobile
            ? "0 16px calc(16px + env(safe-area-inset-bottom, 0px))"
            : "0 24px 36px 24px",
          overflowY: "auto",
        },
        header: isMobile ? { padding: "12px 16px" } : undefined,
      }}
    >
      {open && (
        <ProductInstagramAiDrawerContent
          categoryOptions={categoryOptions}
          onFillProductForm={onFillProductForm}
        />
      )}
    </Drawer>
  );
};
