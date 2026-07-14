import { CaretUpIcon, TagIcon } from "@phosphor-icons/react";
import {
  Alert,
  Badge,
  Button,
  Empty,
  Flex,
  Skeleton,
  Typography,
  theme,
} from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";
import type { CatalogVariant } from "@/features/products/model/product.types";
import { useWishlistStore } from "@/features/wishlist/model/use-wishlist-store";

import { ProductSuggestionProduct } from "./product-suggestion-product";
import * as S from "./product-suggestions-panel.styled";

const { Text } = Typography;

type ProductSuggestionsPanelProps = {
  clientId: number | null;
  conversationId: string;
  orderDraftVariantIds: Set<number>;
  onAddToOrder: (variant: CatalogVariant) => void;
};

export const ProductSuggestionsPanel = observer(
  ({
    clientId,
    conversationId,
    orderDraftVariantIds,
    onAddToOrder,
  }: ProductSuggestionsPanelProps) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const conversationsStore = useConversationsStore();
    const wishlistStore = useWishlistStore();
    const [open, setOpen] = useState(false);
    const [activeProductId, setActiveProductId] = useState<number | null>(null);

    const suggestions =
      conversationsStore.productSuggestionsByConversationId[conversationId];
    const count = suggestions?.items.length ?? 0;
    const loading =
      conversationsStore.productSuggestionsLoadingConversationId ===
      conversationId;
    const error =
      conversationsStore.productSuggestionsErrorByConversationId[
        conversationId
      ] ?? null;
    const visible = loading || error != null || count > 0;

    useEffect(() => {
      setOpen(false);
      setActiveProductId(null);
    }, [conversationId]);

    useEffect(() => {
      if (clientId == null || !visible) {
        return;
      }

      void wishlistStore.loadProducts(clientId).catch(() => undefined);
    }, [clientId, visible, wishlistStore]);

    if (!visible) {
      return null;
    }

    return (
      <S.Root>
        <S.Header
          onClick={() =>
            setOpen((current) => {
              if (current) {
                setActiveProductId(null);
              }

              return !current;
            })
          }
        >
          <Flex align="center" justify="space-between" gap={12}>
            <Flex align="center" gap={10} style={{ minWidth: 0 }}>
              <TagIcon size={16} />
              <Text strong ellipsis>
                {t("conversation.productSuggestions.title")}
              </Text>
              <Badge color={token.colorPrimary} count={count} />
            </Flex>

            <Button type="link" size="small">
              {open
                ? t("conversation.productSuggestions.collapse")
                : t("conversation.productSuggestions.expand")}
              <S.Caret $open={open}>
                <CaretUpIcon size={14} />
              </S.Caret>
            </Button>
          </Flex>
        </S.Header>

        <S.Body $open={open} aria-hidden={!open}>
          <S.BodyContent inert={!open}>
            <S.BodyInner>
              {loading && count === 0 ? (
                <Skeleton active avatar paragraph={{ rows: 3 }} />
              ) : error != null && count === 0 ? (
                <Alert type="error" showIcon message={error} />
              ) : count === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t("conversation.productSuggestions.empty")}
                />
              ) : (
                <Flex vertical gap={6}>
                  {suggestions?.items.map((product) => (
                    <ProductSuggestionProduct
                      key={product.id}
                      active={activeProductId === product.id}
                      clientId={clientId}
                      conversationId={conversationId}
                      orderDraftVariantIds={orderDraftVariantIds}
                      onAddToOrder={onAddToOrder}
                      product={product}
                      onOpenChange={(nextOpen) =>
                        setActiveProductId(nextOpen ? product.id : null)
                      }
                    />
                  ))}
                </Flex>
              )}
            </S.BodyInner>
          </S.BodyContent>
        </S.Body>
      </S.Root>
    );
  },
);

ProductSuggestionsPanel.displayName = "ProductSuggestionsPanel";
