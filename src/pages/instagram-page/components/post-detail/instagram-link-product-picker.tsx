import { PlusIcon } from "@phosphor-icons/react";
import { Button, Flex, Popover, Select, Spin, Typography, message } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { useInstagramStore } from "@/features/instagram/model/use-instagram-store";
import { productsApi } from "@/features/products/api/products-api";
import { CatalogVariantSearchItem } from "@/features/products/components/catalog-variant-search-item";
import type { CatalogVariant } from "@/features/products/model/product.types";

import * as S from "../../instagram-page.styled";

const { Text } = Typography;

const MIN_SEARCH_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 300;

type VariantSelectOption = {
  label: string;
  value: number;
  variant: CatalogVariant;
};

type InstagramLinkProductPickerProps = {
  disabled?: boolean;
  permalink?: string;
  postId: string;
};

export const InstagramLinkProductPicker = observer(
  ({ disabled, permalink, postId }: InstagramLinkProductPickerProps) => {
    const { t } = useTranslation();
    const store = useInstagramStore();
    const [messageApi, contextHolder] = message.useMessage();
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [variants, setVariants] = useState<CatalogVariant[]>([]);
    const [loading, setLoading] = useState(false);
    const [productPickerKey, setProductPickerKey] = useState(0);
    const requestSeqRef = useRef(0);
    const trimmedSearch = searchQuery.trim();

    useEffect(() => {
      if (!open || trimmedSearch.length < MIN_SEARCH_LENGTH) {
        return;
      }

      const requestSeq = requestSeqRef.current + 1;
      requestSeqRef.current = requestSeq;

      const timer = window.setTimeout(() => {
        setLoading(true);

        void productsApi
          .listCatalogVariants({ keyword: trimmedSearch })
          .then((response) => {
            if (requestSeqRef.current === requestSeq) {
              setVariants(response.items);
            }
          })
          .catch(() => {
            if (requestSeqRef.current === requestSeq) {
              setVariants([]);
            }
          })
          .finally(() => {
            if (requestSeqRef.current === requestSeq) {
              setLoading(false);
            }
          });
      }, SEARCH_DEBOUNCE_MS);

      return () => window.clearTimeout(timer);
    }, [open, trimmedSearch]);

    const variantSelectOptions = useMemo<VariantSelectOption[]>(
      () =>
        variants.map((variant) => ({
          value: variant.id,
          label: variant.label,
          variant,
        })),
      [variants],
    );

    const variantsById = useMemo(
      () => new Map(variants.map((variant) => [variant.id, variant])),
      [variants],
    );

    const resetSearch = useCallback(() => {
      requestSeqRef.current += 1;
      setSearchQuery("");
      setVariants([]);
      setLoading(false);
      setProductPickerKey((key) => key + 1);
    }, []);

    const handleSearch = useCallback((value: string) => {
      setSearchQuery(value);

      if (value.trim().length < MIN_SEARCH_LENGTH) {
        requestSeqRef.current += 1;
        setVariants([]);
        setLoading(false);
      }
    }, []);

    const handleOpenChange = useCallback(
      (nextOpen: boolean) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          resetSearch();
        }
      },
      [resetSearch],
    );

    const handleVariantSelect = useCallback(
      (variantId: number) => {
        const variant = variantsById.get(variantId);

        if (!variant) {
          return;
        }

        setOpen(false);
        resetSearch();

        void store
          .linkProductToPost({
            productId: variant.productId,
            productVariantId: variant.id,
            postId,
            permalink,
          })
          .then(() => {
            messageApi.success(t("instagram.linkProductSuccess"));
          })
          .catch((error: unknown) => {
            messageApi.error(
              getApiErrorMessage(error, t("instagram.linkProductFailed")),
            );
          });
      },
      [messageApi, permalink, postId, resetSearch, store, t, variantsById],
    );

    return (
      <>
        {contextHolder}
        <Popover
          arrow={false}
          content={
            <S.LinkProductPickerDropdown>
              <Select
                key={productPickerKey}
                showSearch={{
                  onSearch: handleSearch,
                  filterOption: false,
                }}
                autoFocus
                open={open}
                allowClear
                placeholder={t("instagram.productSearchPlaceholder")}
                loading={loading}
                style={{ width: "100%" }}
                listHeight={320}
                options={variantSelectOptions}
                onClear={resetSearch}
                onSelect={handleVariantSelect}
                notFoundContent={
                  loading ? (
                    <Flex justify="center" style={{ padding: 12 }}>
                      <Spin size="small" />
                    </Flex>
                  ) : trimmedSearch.length < MIN_SEARCH_LENGTH ? (
                    <Text type="secondary">
                      {t("instagram.searchMinChars", {
                        count: MIN_SEARCH_LENGTH,
                      })}
                    </Text>
                  ) : (
                    t("instagram.searchNoResults")
                  )
                }
                optionRender={(option) => {
                  const variant = variantsById.get(Number(option.value));

                  if (!variant) {
                    return option.label;
                  }

                  return <CatalogVariantSearchItem variant={variant} />;
                }}
              />
            </S.LinkProductPickerDropdown>
          }
          destroyOnHidden
          open={open}
          placement="bottomRight"
          trigger="click"
          onOpenChange={handleOpenChange}
        >
          <Button
            disabled={disabled || store.linkProductLoading}
            icon={<PlusIcon size={16} />}
            loading={store.linkProductLoading}
          >
            {store.linkProductLoading
              ? t("instagram.linkingProduct")
              : t("instagram.linkProduct")}
          </Button>
        </Popover>
      </>
    );
  },
);
