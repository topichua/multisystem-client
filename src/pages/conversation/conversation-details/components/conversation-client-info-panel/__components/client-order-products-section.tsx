import type { ReactNode } from "react";
import {
  Alert,
  Card,
  Divider,
  Flex,
  Select,
  Spin,
  Tag,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";

import type { OrderDraftLine } from "@/features/orders/model/order.types";
import type { CatalogVariant } from "@/features/products/model/product.types";

import { CatalogVariantSearchItem } from "./catalog-variant-search-item";
import { ClientOrderLinesTable } from "./client-order-lines-table";
import type { VariantSelectOptionData } from "./use-client-order-create-controller";
import { ProductCard } from "./product-card";

const { Text } = Typography;

const recommendedProducts = [
  {
    id: "1",
    title: "White Hoodie",
    imageUrl:
      "https://cdn.pixabay.com/photo/2020/10/05/10/51/cat-5628953_1280.jpg",
    size: "L",
    color: "White",
    price: 1250,
    stockCount: 8,
  },
  {
    id: "2",
    title: "Black Hoodie",
    imageUrl:
      "https://i.pinimg.com/236x/c6/2e/47/c62e47ccce4e8e568c9c7e381032bde9.jpg",
    size: "M",
    color: "Black",
    price: 1390,
    stockCount: 4,
  },
  {
    id: "3",
    title: "Grey Hoodie",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1673967831980-1d377baaded2?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2F0c3xlbnwwfHwwfHx8MA%3D%3D",
    size: "XL",
    color: "Grey",
    price: 1190,
    stockCount: 12,
  },
];

type VariantSelectOption = {
  label: string;
  value: number;
  variant: CatalogVariant;
};

type ClientOrderProductsSectionProps = {
  catalogSearchLoading: boolean;
  minSearchLength: number;
  orderLines: OrderDraftLine[];
  productPickerKey: number;
  title: ReactNode;
  trimmedSearch: string;
  variantSelectOptions: VariantSelectOption[];
  onProductSearch: (value: string) => void;
  onQuantityChange: (variantId: number, quantity: number) => void;
  onRemoveLine: (variantId: number) => void;
  onVariantSelect: (variantId: number) => void;
};

export function ClientOrderProductsSection({
  catalogSearchLoading,
  minSearchLength,
  orderLines,
  productPickerKey,
  title,
  trimmedSearch,
  variantSelectOptions,
  onProductSearch,
  onQuantityChange,
  onRemoveLine,
  onVariantSelect,
}: ClientOrderProductsSectionProps) {
  const { t } = useTranslation();

  return (
    <Card
      size="small"
      title={title}
      extra={
        <Tag color="processing">
          {t("conversation.clientOrders.drawer.tagRecommended")}
        </Tag>
      }
      styles={{
        root: {
          borderColor: "#e2e1e1",
        },
        header: {
          borderColor: "#e2e1e1",
        },
      }}
    >
      <Flex vertical gap={16}>
        <Alert
          type="info"
          showIcon={false}
          title={
            <Text strong italic>
              {t("conversation.clientOrders.drawer.recommendedTitle")}
            </Text>
          }
          description={
            <Flex vertical gap={12}>
              <Text>
                {t("conversation.clientOrders.drawer.recommendedDescription")}
              </Text>
              <Flex justify="space-between" gap={8}>
                {recommendedProducts.map((item) => (
                  <ProductCard
                    key={item.id}
                    title={item.title}
                    imageUrl={item.imageUrl}
                    size={item.size}
                    color={item.color}
                    price={item.price}
                    stockCount={item.stockCount}
                    checked={false}
                    onChange={() => undefined}
                  />
                ))}
              </Flex>
            </Flex>
          }
        />

        <Divider plain>
          {t("conversation.clientOrders.drawer.addProductDivider")}
        </Divider>

        <Select
          key={productPickerKey}
          showSearch={{
            onSearch: onProductSearch,
            filterOption: false,
          }}
          allowClear
          placeholder={t(
            "conversation.clientOrders.drawer.productSearchPlaceholder",
          )}
          loading={catalogSearchLoading}
          style={{ width: "100%" }}
          listHeight={320}
          options={variantSelectOptions}
          onSelect={onVariantSelect}
          notFoundContent={
            catalogSearchLoading ? (
              <Flex justify="center" style={{ padding: 12 }}>
                <Spin size="small" />
              </Flex>
            ) : trimmedSearch.length < minSearchLength ? (
              <Text type="secondary">
                {t("conversation.clientOrders.drawer.searchMinChars", {
                  count: minSearchLength,
                })}
              </Text>
            ) : (
              t("conversation.clientOrders.drawer.searchNoResults")
            )
          }
          optionRender={(option) => {
            const data = option.data as VariantSelectOptionData | undefined;
            if (!data?.variant) {
              return option.label;
            }

            return <CatalogVariantSearchItem variant={data.variant} />;
          }}
        />

        <Divider plain>
          {t("conversation.clientOrders.drawer.addedProductsDivider")}
        </Divider>

        <ClientOrderLinesTable
          orderLines={orderLines}
          onQuantityChange={onQuantityChange}
          onRemove={onRemoveLine}
        />
      </Flex>
    </Card>
  );
}
