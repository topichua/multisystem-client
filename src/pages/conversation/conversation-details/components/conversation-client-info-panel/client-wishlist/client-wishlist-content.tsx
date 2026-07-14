import { HeartIcon } from "@phosphor-icons/react";
import { Empty, Flex, Space, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { CenteredSpinner } from "@/components/loading/centered-spinner";
import type { CatalogVariant } from "@/features/products/model/product.types";

import { ClientWishlistItem } from "./client-wishlist-item";

const { Text } = Typography;

type ClientWishlistContentProps = {
  clientId: number;
  addOpen: boolean;
  loading: boolean;
  error?: string | null;
  heartColor: string;
  variants: CatalogVariant[];
};

export function ClientWishlistContent({
  clientId,
  addOpen,
  loading,
  error,
  heartColor,
  variants,
}: ClientWishlistContentProps) {
  const { t } = useTranslation();

  if (loading) {
    return <CenteredSpinner minHeight={64} />;
  }

  if (error) {
    return <Text type="danger">{error}</Text>;
  }

  if (variants.length > 0) {
    return (
      <Flex vertical gap={8}>
        {variants.map((variant) => (
          <ClientWishlistItem
            key={variant.id}
            clientId={clientId}
            variant={variant}
          />
        ))}
      </Flex>
    );
  }

  if (addOpen) {
    return null;
  }

  return (
    <Empty
      image={<HeartIcon size={40} color={heartColor} />}
      description={
        <Space orientation="vertical" size={4}>
          <Text type="secondary">
            {t("conversation.clientProfile.wishlist.emptyTitle")}
          </Text>

          <Text type="secondary" style={{ fontSize: 13 }}>
            {t("conversation.clientProfile.wishlist.emptyDescription")}
          </Text>
        </Space>
      }
    />
  );
}
