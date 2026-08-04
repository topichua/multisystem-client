import { HeartIcon } from "@phosphor-icons/react";
import {
  Alert,
  Button,
  Divider,
  Drawer,
  Empty,
  Flex,
  Spin,
  Typography,
  theme,
} from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { getInventoryDrawerLayoutProps } from "@/features/products/components/product-inventory-drawer/product-inventory-drawer-layout";
import { useVariantWishlistClientsStore } from "@/features/wishlist/model/use-variant-wishlist-clients-store";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { VariantWishlistClientsListItem } from "./variant-wishlist-clients-list-item";

const { Text, Title } = Typography;

export const VariantWishlistClientsDrawer = observer(
  function VariantWishlistClientsDrawer() {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const store = useVariantWishlistClientsStore();
    const isMobileViewport = useIsMobileViewport();
    const drawerLayout = getInventoryDrawerLayoutProps({
      isMobile: isMobileViewport,
      desktopSize: 600,
    });

    const total = store.data?.total ?? store.data?.items.length ?? 0;
    const items = store.data?.items ?? [];

    return (
      <Drawer
        destroyOnHidden
        open={store.open}
        onClose={store.closeDrawer}
        closable={{
          "aria-label": t("products.variant.wishlistClients.closeAria"),
          placement: "end",
        }}
        title={
          <Flex vertical gap={2}>
            <Flex align="center" gap={12}>
              <HeartIcon
                size={20}
                weight="fill"
                color={token.colorError}
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <Title level={isMobileViewport ? 5 : 4} style={{ margin: 0 }}>
                {t("products.variant.wishlistClients.title")}
              </Title>
            </Flex>
            {store.subtitle && (
              <Text type="secondary" ellipsis={{ tooltip: store.subtitle }}>
                {store.subtitle}
              </Text>
            )}
          </Flex>
        }
        {...drawerLayout}
      >
        {store.loading && (
          <Flex align="center" justify="center" style={{ minHeight: 180 }}>
            <Spin />
          </Flex>
        )}

        {!store.loading && store.error && (
          <Alert
            showIcon
            type="error"
            title={store.error}
            action={
              <Button size="small" onClick={store.retry}>
                {t("products.variant.wishlistClients.retry")}
              </Button>
            }
          />
        )}

        {!store.loading && !store.error && (
          <Flex vertical gap={12}>
            <Text type="secondary">
              {t("products.variant.wishlistClients.waitingCount", {
                count: total,
              })}
            </Text>

            <Divider size="small" />

            {items.length === 0 ? (
              <Empty
                description={t("products.variant.wishlistClients.empty")}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Flex vertical>
                {items.map((item, index) => (
                  <VariantWishlistClientsListItem
                    key={item.id}
                    item={item}
                    showDivider={index < items.length - 1}
                  />
                ))}
              </Flex>
            )}
          </Flex>
        )}
      </Drawer>
    );
  },
);
