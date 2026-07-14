import {
  CaretDownIcon,
  CubeIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Button, Modal } from "antd";
// import { Tag } from "@/components/tag/tag";
import { useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import type { Product } from "@/features/products/model/product.types";
import {
  formatProductVariantListMetaLine,
  getProductPriceRange,
  getSingleVariantListMeta,
  // productStatusToColor,
  // variantStatusToColor,
} from "@/features/products/utils/product-display";

import { ProductsListVariantCard } from "../components/products-list-variant-card";

import * as S from "./mobile-products-list-page.styled";

const CARD_NAVIGATION_BLOCKER_SELECTOR =
  "a,button,input,select,textarea,[role='button'],[role='combobox'],.ant-select,.rc-select,.ant-select-selector,.ant-modal-wrap,.ant-popover,.ant-popconfirm,[data-qa^='products-mobile-action-'],[data-qa^='products-mobile-expand-'],[data-qa^='products-list-variant-']";

type MobileProductCardProps = {
  product: Product;
  categoryName: string;
  deleteLoading: boolean;
  showInventoryQuantity: boolean;
  showInventoryManagement: boolean;
  onEdit: (productId: number) => void;
  onDelete: (productId: number) => Promise<void>;
  onOpenInventory: (product: Product) => void;
  onOpenVariantInventory: (product: Product, variantId: number) => void;
};

export const MobileProductCard = ({
  product,
  categoryName,
  deleteLoading,
  showInventoryQuantity,
  showInventoryManagement,
  onEdit,
  onDelete,
  onOpenInventory,
  onOpenVariantInventory,
}: MobileProductCardProps) => {
  const { t } = useTranslation();
  const variantsCount = product.variants?.length ?? 0;
  const hasMultipleVariants = variantsCount > 1;
  const singleVariantMeta = getSingleVariantListMeta(product);
  const [expanded, setExpanded] = useState(false);

  const priceLabel = getProductPriceRange(product) ?? t("products.noPrice");

  const quantityLabel = showInventoryQuantity
    ? product.inStock === false
      ? t("products.outOfStock")
      : product.quantity == null
        ? t("products.unknownQuantity")
        : t("products.mobile.qty", { value: product.quantity })
    : null;

  const secondaryMeta =
    variantsCount > 0
      ? singleVariantMeta
        ? formatProductVariantListMetaLine(
            singleVariantMeta,
            t("products.variant.fallbackName"),
          )
        : t("products.table.variantsCount", { count: variantsCount })
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
      </S.CardTopRow>

      <S.CardBottomRow justify="space-between" align="center">
        <S.PriceQuantity>
          {[priceLabel, quantityLabel].filter(Boolean).join(" · ")}
        </S.PriceQuantity>

        {/* <S.StatusWrap>
          <Tag color={productStatusToColor(product.status)}>
            {product.status}
          </Tag>
        </S.StatusWrap> */}

        {hasMultipleVariants ? (
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

      {hasMultipleVariants && expanded && (
        <S.VariantsSection
          id={`products-mobile-variants-${product.id}`}
          data-qa={`products-mobile-variants-${product.id}`}
        >
          <S.VariantsSectionTitle>
            {t("products.mobile.variantsSectionTitle", {
              count: variantsCount,
            })}
          </S.VariantsSectionTitle>
          {product.variants?.map((variant) => (
            <S.VariantRow
              key={variant.id}
              data-qa={`products-mobile-variant-${variant.id}`}
            >
              <ProductsListVariantCard
                product={product}
                variant={variant}
                showInventoryQuantity={showInventoryQuantity}
                showInventoryManagement={showInventoryManagement}
                onOpenInventory={onOpenVariantInventory}
                onEdit={onEdit}
              />
            </S.VariantRow>
          ))}
        </S.VariantsSection>
      )}

      <S.CardActionsRow
        align="center"
        justify="center"
        gap={12}
        onClick={stopCardNavigation}
        onMouseDown={stopCardNavigation}
        onPointerDown={stopCardNavigation}
      >
        {showInventoryManagement ? (
          <Button
            type="text"
            size="small"
            icon={<CubeIcon size={16} />}
            aria-label={t("system.inventory.title")}
            data-qa={`products-mobile-action-inventory-${product.id}`}
            onClick={() => onOpenInventory(product)}
          />
        ) : null}
        <Button
          type="text"
          size="small"
          icon={<PencilSimpleIcon size={16} />}
          aria-label={t("products.edit")}
          data-qa={`products-mobile-action-edit-${product.id}`}
          onClick={() => void onEdit(product.id)}
        />
        <Button
          type="text"
          size="small"
          danger
          loading={deleteLoading}
          icon={<TrashIcon size={16} />}
          aria-label={t("products.delete")}
          data-qa={`products-mobile-action-delete-${product.id}`}
          onClick={() => {
            Modal.confirm({
              title: t("products.deleteConfirm"),
              okText: t("products.delete"),
              okType: "danger",
              onOk: () => onDelete(product.id),
            });
          }}
        />
      </S.CardActionsRow>
    </S.ProductCard>
  );
};
