import {
  CaretDownIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Button, Dropdown, Modal } from "antd";
import { Tag } from "@/components/tag/tag";
import { useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import type { Product } from "@/features/products/model/product.types";
import {
  formatProductPrice,
  getVariantTitle,
  productStatusToColor,
  variantStatusToColor,
} from "@/features/products/utils/product-display";

import * as S from "./mobile-products-list-page.styled";

const CARD_NAVIGATION_BLOCKER_SELECTOR =
  "a,button,input,select,textarea,[role='button'],[role='combobox'],.ant-select,.rc-select,.ant-select-selector,.ant-dropdown,.ant-dropdown-menu,.ant-modal-wrap,.ant-popover,.ant-popconfirm,[data-qa^='products-mobile-actions-'],[data-qa^='products-mobile-expand-']";

type MobileProductCardProps = {
  product: Product;
  categoryName: string;
  deleteLoading: boolean;
  onEdit: (productId: number) => void;
  onDelete: (productId: number) => Promise<void>;
};

export const MobileProductCard = ({
  product,
  categoryName,
  deleteLoading,
  onEdit,
  onDelete,
}: MobileProductCardProps) => {
  const { t } = useTranslation();
  const variantsCount = product.variants?.length ?? 0;
  const hasVariants = variantsCount > 0;
  const [expanded, setExpanded] = useState(false);

  const priceLabel =
    product.price != null
      ? formatProductPrice(product.price, product.currency)
      : t("products.noPrice");

  const quantityLabel =
    product.inStock === false
      ? t("products.outOfStock")
      : product.quantity == null
        ? t("products.unknownQuantity")
        : t("products.mobile.qty", { value: product.quantity });

  const secondaryMeta = hasVariants
    ? t("products.table.variantsCount", { count: variantsCount })
    : null;

  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest(CARD_NAVIGATION_BLOCKER_SELECTOR)) {
      return;
    }

    void onEdit(product.id);
  };

  const stopCardNavigation = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  return (
    <S.ProductCard
      data-qa={`products-mobile-card-${product.id}`}
      data-qa-open={`products-mobile-open-${product.id}`}
      onClick={handleCardClick}
    >
      <S.CardTopRow align="flex-start">
        <S.ProductInfo>
          <S.Thumbnail $src={product.mainImageUrl} aria-hidden />
          <S.ProductCopy>
            <S.ProductName>{product.name}</S.ProductName>
            <S.ProductMeta>
              {[secondaryMeta, categoryName].filter(Boolean).join(" · ")}
            </S.ProductMeta>
          </S.ProductCopy>
        </S.ProductInfo>

        <S.ActionsWrap
          onClick={stopCardNavigation}
          onMouseDown={stopCardNavigation}
          onPointerDown={stopCardNavigation}
        >
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                {
                  key: "edit",
                  label: t("products.edit"),
                  icon: <PencilSimpleIcon size={16} />,
                },
                {
                  key: "delete",
                  label: t("products.delete"),
                  danger: true,
                  disabled: deleteLoading,
                  icon: <TrashIcon size={16} />,
                },
              ],
              onClick: ({ key, domEvent }) => {
                domEvent.stopPropagation();
                if (key === "edit") {
                  void onEdit(product.id);
                  return;
                }
                if (key === "delete") {
                  Modal.confirm({
                    title: t("products.deleteConfirm"),
                    okText: t("products.delete"),
                    okType: "danger",
                    onOk: () => onDelete(product.id),
                  });
                }
              },
            }}
          >
            <Button
              type="text"
              size="small"
              loading={deleteLoading}
              icon={<DotsThreeIcon size={25} />}
              aria-label={t("products.table.actions")}
              data-qa={`products-mobile-actions-${product.id}`}
              onClick={stopCardNavigation}
              onMouseDown={stopCardNavigation}
            />
          </Dropdown>
        </S.ActionsWrap>
      </S.CardTopRow>

      <S.CardBottomRow justify="space-between" align="center">
        <S.PriceQuantity>
          {priceLabel} · {quantityLabel}
        </S.PriceQuantity>

        <S.StatusWrap>
          <Tag color={productStatusToColor(product.status)}>
            {product.status}
          </Tag>
        </S.StatusWrap>

        {hasVariants ? (
          <S.ExpandButton
            type="text"
            size="small"
            aria-expanded={expanded}
            aria-controls={`products-mobile-variants-${product.id}`}
            aria-label={
              expanded
                ? t("products.table.collapseRowAria")
                : t("products.table.expandRowAria")
            }
            data-qa={`products-mobile-expand-${product.id}`}
            icon={
              <CaretDownIcon
                size={16}
                style={{
                  transform: expanded ? "rotate(180deg)" : undefined,
                  transition: "transform 0.2s ease",
                }}
              />
            }
            onClick={(event) => {
              stopCardNavigation(event);
              setExpanded((prev) => !prev);
            }}
            onMouseDown={stopCardNavigation}
            onPointerDown={stopCardNavigation}
          />
        ) : null}
      </S.CardBottomRow>

      {hasVariants && expanded ? (
        <S.VariantsSection
          id={`products-mobile-variants-${product.id}`}
          data-qa={`products-mobile-variants-${product.id}`}
        >
          <S.VariantsSectionTitle>
            {t("products.mobile.variantsSectionTitle", {
              count: variantsCount,
            })}
          </S.VariantsSectionTitle>
          {product.variants?.map((variant) => {
            const title = getVariantTitle(variant);
            const variantName =
              title || `${t("products.variant.fallbackName")} #${variant.id}`;
            const variantPrice = formatProductPrice(
              variant.price,
              product.currency,
            );
            const variantQuantity =
              variant.quantity == null ? "—" : String(variant.quantity);
            const skuPart = variant.sku ? ` · ${variant.sku}` : "";

            return (
              <S.VariantRow
                key={variant.id}
                data-qa={`products-mobile-variant-${variant.id}`}
              >
                <S.VariantName>{variantName}</S.VariantName>
                <S.VariantDetails>
                  <Tag color={variantStatusToColor(variant.status)}>
                    {variant.status}
                  </Tag>
                  {` · ${variantPrice} · ${t("products.variant.quantity")} ${variantQuantity}${skuPart}`}
                </S.VariantDetails>
              </S.VariantRow>
            );
          })}
        </S.VariantsSection>
      ) : null}
    </S.ProductCard>
  );
};
