import { Collapse, Flex } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useState, type MouseEvent } from "react";
import { useTheme } from "styled-components";

import { productToCatalogVariants } from "@/features/products/utils/catalog-variant-display";
import { useWishlistStore } from "@/features/wishlist/model/use-wishlist-store";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";

import { ClientWishlistAddSearch } from "./client-wishlist-add-search";
import { ClientWishlistContent } from "./client-wishlist-content";
import { ClientWishlistHeader } from "./client-wishlist-header";

const WISHLIST_COLLAPSE_KEY = "wishlist";

type ClientWishlistSectionProps = {
  clientId: number;
  conversationId?: number;
};

export const ClientWishlistSection = observer(
  ({ clientId, conversationId }: ClientWishlistSectionProps) => {
    const { colors } = useTheme();

    const workspaceSettingsStore = useWorkspaceSettingsStore();
    const wishlistStore = useWishlistStore();

    const [addOpen, setAddOpen] = useState(false);
    const [activeKeys, setActiveKeys] = useState<string[]>([
      WISHLIST_COLLAPSE_KEY,
    ]);

    const heartColor = colors.base.red[5];
    const wishlistEnabled = workspaceSettingsStore.wishlistEnabled;

    useEffect(() => {
      if (
        workspaceSettingsStore.initialized ||
        workspaceSettingsStore.loadLoading
      ) {
        return;
      }

      void workspaceSettingsStore.loadSettings({ silent: true });
    }, [workspaceSettingsStore]);

    useEffect(() => {
      if (!wishlistEnabled) {
        return;
      }

      void wishlistStore.loadProducts(clientId);
    }, [clientId, wishlistEnabled, wishlistStore]);

    useEffect(() => {
      setAddOpen(false);
    }, [clientId]);

    if (!wishlistEnabled) {
      return null;
    }

    const variants = wishlistStore
      .getProducts(clientId)
      .flatMap(productToCatalogVariants);

    const wishlistedVariantIds = new Set(variants.map((variant) => variant.id));

    const handleOpenAdd = (event: MouseEvent<HTMLElement>) => {
      event.stopPropagation();

      setActiveKeys([WISHLIST_COLLAPSE_KEY]);
      setAddOpen(true);
    };

    const handleCloseAdd = (event: MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      setAddOpen(false);
    };

    const content = (
      <Flex vertical gap={12}>
        {addOpen && (
          <ClientWishlistAddSearch
            clientId={clientId}
            conversationId={conversationId}
            wishlistedVariantIds={wishlistedVariantIds}
          />
        )}

        <ClientWishlistContent
          clientId={clientId}
          addOpen={addOpen}
          loading={wishlistStore.isProductsLoading(clientId)}
          error={wishlistStore.getProductsError(clientId)}
          heartColor={heartColor}
          variants={variants}
        />
      </Flex>
    );

    return (
      <Collapse
        ghost
        activeKey={activeKeys}
        expandIconPlacement="start"
        onChange={setActiveKeys}
        items={[
          {
            key: WISHLIST_COLLAPSE_KEY,
            label: (
              <ClientWishlistHeader
                addOpen={addOpen}
                heartColor={heartColor}
                onAdd={handleOpenAdd}
                onClose={handleCloseAdd}
              />
            ),
            children: content,
          },
        ]}
        styles={{
          header: {
            padding: 0,
          },
          body: {
            padding: "12px 0 0",
          },
        }}
      />
    );
  },
);
