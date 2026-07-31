import type { MouseEvent } from "react";

import {
  ArchiveIcon,
  ArrowClockwiseIcon,
  CubeIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import {
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Row,
  Spin,
  Tooltip,
  Typography,
  theme,
} from "antd";
import { Tag } from "@/components/tag/tag";
import { useTranslation } from "react-i18next";

import type { Product } from "@/features/products/model/product.types";
import {
  formatProductPrice,
  isArchivedStatus,
  productStatusToColor,
  resolveProductImageSrc,
} from "@/features/products/utils/product-display";

const { Text } = Typography;

type ProductsListGridProps = {
  products: Product[];
  loading: boolean;
  categoryNameById: Map<number, string>;
  onOpenProduct: (productId: number) => void;
  onArchive: (product: Product) => void;
  onUnarchive: (product: Product) => void;
  onDelete: (product: Product) => void;
  deleteLoadingId: number | null;
  archiveLoadingId: number | null;
  showInventoryQuantity: boolean;
  showInventoryManagement: boolean;
  onOpenInventory: (product: Product) => void;
};

export const ProductsListGrid = ({
  products,
  loading,
  categoryNameById,
  onOpenProduct,
  onArchive,
  onUnarchive,
  onDelete,
  deleteLoadingId,
  archiveLoadingId,
  showInventoryQuantity,
  showInventoryManagement,
  onOpenInventory,
}: ProductsListGridProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const handleCardClick =
    (product: Product) =>
    (event: MouseEvent<HTMLDivElement>): void => {
      const target = event.target as HTMLElement;
      if (target.closest("button") || target.closest("a")) {
        return;
      }
      if (isArchivedStatus(product.status)) {
        return;
      }
      onOpenProduct(product.id);
    };

  return (
    <Spin spinning={loading}>
      {products.length === 0 && !loading ? (
        <Empty />
      ) : (
        <Row gutter={[16, 16]}>
          {products.map((product) => {
            const isArchived = isArchivedStatus(product.status);
            const archiveLabel = isArchived
              ? t("products.unarchive")
              : t("products.archive");

            return (
              <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable={!isArchived}
                  styles={{
                    body: {
                      padding: 12,
                      ...(isArchived
                        ? { color: token.colorTextQuaternary }
                        : null),
                    },
                  }}
                  onClick={handleCardClick(product)}
                  cover={
                    <div
                      style={{
                        height: 160,
                        background: token.colorFillAlter,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: isArchived ? 0.55 : 1,
                      }}
                    >
                      {product.mainImageUrl ? (
                        <img
                          src={product.mainImageUrl}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <img
                          src={resolveProductImageSrc(null)}
                          alt=""
                          style={{
                            width: "56%",
                            height: "56%",
                            objectFit: "contain",
                            opacity: 0.7,
                          }}
                        />
                      )}
                    </div>
                  }
                >
                  <Flex vertical gap={8}>
                    <Text
                      strong
                      ellipsis={{ tooltip: product.name }}
                      type={isArchived ? "secondary" : undefined}
                    >
                      {product.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {product.categoryId != null
                        ? (categoryNameById.get(product.categoryId) ??
                          `#${product.categoryId}`)
                        : t("products.noCategory")}
                    </Text>
                    <Text type={isArchived ? "secondary" : undefined}>
                      {formatProductPrice(
                        product.price,
                        product.currency,
                        t("products.noPrice"),
                      )}
                    </Text>
                    {showInventoryQuantity && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {product.inStock === false
                          ? t("products.outOfStock")
                          : product.quantity == null
                            ? t("products.unknownQuantity")
                            : String(product.quantity)}
                      </Text>
                    )}
                    <Tag
                      color={productStatusToColor(product.status)}
                      style={{ width: "fit-content" }}
                    >
                      {product.status}
                    </Tag>
                    <Flex
                      gap={4}
                      wrap="wrap"
                      align="center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {showInventoryManagement && !isArchived && (
                        <Tooltip title={t("system.inventory.title")}>
                          <Button
                            type="text"
                            size="small"
                            icon={<CubeIcon size={18} />}
                            aria-label={t("system.inventory.title")}
                            onClick={() => onOpenInventory(product)}
                          />
                        </Tooltip>
                      )}
                      <Tooltip title={archiveLabel}>
                        <Button
                          type="text"
                          size="small"
                          loading={archiveLoadingId === product.id}
                          icon={
                            isArchived ? (
                              <ArrowClockwiseIcon size={18} />
                            ) : (
                              <ArchiveIcon size={18} />
                            )
                          }
                          aria-label={archiveLabel}
                          onClick={() =>
                            isArchived
                              ? onUnarchive(product)
                              : onArchive(product)
                          }
                        />
                      </Tooltip>
                      <Button
                        type="text"
                        size="small"
                        danger
                        loading={deleteLoadingId === product.id}
                        icon={<TrashIcon size={18} />}
                        aria-label={t("products.delete")}
                        onClick={() => onDelete(product)}
                      />
                    </Flex>
                  </Flex>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Spin>
  );
};
