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
};

export const ProductInstagramAiDrawer = ({
  open,
  onClose,
  categoryOptions,
  onFillProductForm,
}: ProductInstagramAiDrawerProps) => {
  const { t } = useTranslation();

  return (
    <Drawer
      title={
        <Flex align="center" gap={12}>
          <InstagramLogoIcon size={34} />
          <Flex vertical>
            <Flex align="center" gap={8}>
              <Title level={4} style={{ margin: 0 }}>
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
      size={960}
      destroyOnHidden
      styles={{
        body: { padding: "0 24px 36px 24px" },
      }}
    >
      {open ? (
        <ProductInstagramAiDrawerContent
          categoryOptions={categoryOptions}
          onFillProductForm={onFillProductForm}
        />
      ) : null}
    </Drawer>
  );
};
