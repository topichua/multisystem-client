import { Button, Card, Divider, Flex, Space, Tag, Typography } from "antd";
import { SparkleIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { InstagramPostAiExtractionResponse } from "@/features/instagram/model/instagram.types";

import type {
  ProductInstagramAiCategoryOption,
  ProductInstagramAiFillHandler,
} from "../product-instagram-ai.types";
import {
  formatExtractionPrice,
  getDisplayAttributes,
  getMatchedCategoryOptions,
  getSelectedExtractionMedia,
} from "../product-instagram-ai.utils";

const { Text, Title } = Typography;

type ProductInstagramExtractionResultProps = {
  categoryOptions: readonly ProductInstagramAiCategoryOption[];
  extraction: InstagramPostAiExtractionResponse;
  fillLoading: boolean;
  onFillProductForm?: ProductInstagramAiFillHandler;
};

type ExtractionFieldCardProps = {
  label: string;
  children: ReactNode;
};

const ExtractionFieldCard = ({ label, children }: ExtractionFieldCardProps) => (
  <Card size="small" style={{ flex: "1 1 300px" }}>
    <Flex vertical gap={8}>
      <Text type="secondary" style={{ textTransform: "uppercase" }}>
        {label}
      </Text>
      {children}
    </Flex>
  </Card>
);

export const ProductInstagramExtractionResult = ({
  categoryOptions,
  extraction,
  fillLoading,
  onFillProductForm,
}: ProductInstagramExtractionResultProps) => {
  const { t } = useTranslation();
  const selectedMedia = getSelectedExtractionMedia(extraction);
  const matchedCategories = getMatchedCategoryOptions(
    extraction,
    categoryOptions,
  );
  const displayAttributes = getDisplayAttributes(extraction);
  const { productName, productDescription, price, brandLabel } =
    extraction.data;

  return (
    <Flex vertical gap={16}>
      <Flex justify="space-between" align="flex-start" gap={16}>
        <Flex align="flex-start" gap={12}>
          <Tag color="purple" icon={<SparkleIcon size={14} />}>
            {t("products.instagram.ai.tag")}
          </Tag>
          <Flex vertical>
            <Title level={4} style={{ margin: 0 }}>
              {t("products.instagram.ai.recognizedTitle")}
            </Title>
            <Text type="secondary">
              {t("products.instagram.ai.recognizedSubtitle")}
            </Text>
          </Flex>
        </Flex>

        <Text type="secondary">
          {new Date(extraction.generatedAt).toLocaleString()}
        </Text>
      </Flex>

      <Flex gap={16} wrap="wrap">
        <ExtractionFieldCard label={t("products.instagram.ai.nameLabel")}>
          <Text strong>
            {productName || t("products.instagram.ai.emptyValue")}
          </Text>
        </ExtractionFieldCard>

        <ExtractionFieldCard label={t("products.instagram.ai.categoryLabel")}>
          {matchedCategories.length > 0 ? (
            <Space wrap>
              {matchedCategories.map((category) => (
                <Tag key={category.value}>{category.label}</Tag>
              ))}
            </Space>
          ) : (
            <Text>{t("products.instagram.ai.emptyValue")}</Text>
          )}
        </ExtractionFieldCard>

        <ExtractionFieldCard label={t("products.instagram.ai.priceLabel")}>
          <Text strong>
            {formatExtractionPrice(
              price,
              t("products.instagram.ai.emptyValue"),
            )}
          </Text>
        </ExtractionFieldCard>

        <ExtractionFieldCard label={t("products.instagram.ai.brandLabel")}>
          <Text>{brandLabel || t("products.instagram.ai.emptyValue")}</Text>
        </ExtractionFieldCard>
      </Flex>

      <ExtractionFieldCard label={t("products.instagram.ai.descriptionLabel")}>
        <Text>
          {productDescription || t("products.instagram.ai.emptyValue")}
        </Text>
      </ExtractionFieldCard>

      <Card size="small">
        <Flex vertical gap={12}>
          <Space>
            <Text strong>{t("products.instagram.ai.attributesTitle")}</Text>
            <Tag color={displayAttributes.length > 0 ? "green" : "default"}>
              {displayAttributes.length > 0
                ? t("products.instagram.ai.attributesDetected")
                : t("products.instagram.ai.attributesEmpty")}
            </Tag>
          </Space>

          {displayAttributes.length > 0 ? (
            <Flex vertical gap={10}>
              {displayAttributes.map((attribute) => (
                <Flex key={attribute.name} gap={12} align="center" wrap="wrap">
                  <Text type="secondary" style={{ minWidth: 120 }}>
                    {attribute.name}
                  </Text>
                  <Space wrap>
                    {attribute.values.map((value) => (
                      <Tag key={`${attribute.name}-${value}`}>{value}</Tag>
                    ))}
                  </Space>
                </Flex>
              ))}
            </Flex>
          ) : (
            <Text type="secondary">
              {t("products.instagram.ai.noAttributes")}
            </Text>
          )}
        </Flex>
      </Card>

      <Flex vertical gap={10}>
        <Text type="secondary">
          {t("products.instagram.ai.photosToGallery", {
            count: selectedMedia.length,
          })}
        </Text>

        {selectedMedia.length > 0 ? (
          <Flex gap={12} wrap="wrap">
            {selectedMedia.map((media) => (
              <div
                key={media.mediaId}
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#f5f5f5",
                }}
              >
                <img
                  src={media.url}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    objectFit: "cover",
                  }}
                />
              </div>
            ))}
          </Flex>
        ) : (
          <Text type="secondary">
            {t("products.instagram.ai.noSelectedPhotos")}
          </Text>
        )}
      </Flex>

      <Divider style={{ margin: 0 }} />

      <Button
        type="primary"
        size="large"
        block
        icon={<SparkleIcon size={18} />}
        loading={fillLoading}
        disabled={!onFillProductForm}
        onClick={() => onFillProductForm?.(extraction)}
      >
        {t("products.instagram.ai.fillProductFormButton")}
      </Button>

      <Text type="secondary">
        {t("products.instagram.ai.editableAfterFillHint")}
      </Text>
    </Flex>
  );
};
