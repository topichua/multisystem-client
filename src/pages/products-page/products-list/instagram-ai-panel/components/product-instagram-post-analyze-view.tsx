import { Alert, Button, Card, Flex, Space, Tag, Typography } from "antd";
import {
  ArrowLeftIcon,
  ChatCircleIcon,
  HeartIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

import { InstagramLogoIcon } from "@/components/icons/instagram/instagram-logo-icon";
import type {
  InstagramMediaItem,
  InstagramPostAiExtractionResponse,
} from "@/features/instagram/model/instagram.types";
import { formatCompactNumber } from "@/pages/instagram-page/utils/instagram-page-format";

import type {
  ProductInstagramAiCategoryOption,
  ProductInstagramAiFillHandler,
} from "../product-instagram-ai.types";
import { ProductInstagramExtractionResult } from "./product-instagram-extraction-result";
import { ProductInstagramPostMediaPreview } from "./product-instagram-post-media-preview";

const { Text } = Typography;

type ProductInstagramPostAnalyzeViewProps = {
  post: InstagramMediaItem;
  analyzeError: string | null;
  analyzeLoading: boolean;
  categoryOptions: readonly ProductInstagramAiCategoryOption[];
  extraction: InstagramPostAiExtractionResponse | null;
  fillLoading: boolean;
  onBack: () => void;
  onAnalyzePost: (post: InstagramMediaItem) => void;
  onFillProductForm?: ProductInstagramAiFillHandler;
};

export const ProductInstagramPostAnalyzeView = ({
  post,
  analyzeError,
  analyzeLoading,
  categoryOptions,
  extraction,
  fillLoading,
  onBack,
  onAnalyzePost,
  onFillProductForm,
}: ProductInstagramPostAnalyzeViewProps) => {
  const { t } = useTranslation();
  const caption = post.caption?.trim();

  return (
    <Flex vertical gap={16}>
      <Button
        type="text"
        icon={<ArrowLeftIcon size={18} />}
        onClick={onBack}
        style={{ alignSelf: "flex-start", paddingInlineStart: 0 }}
      >
        {t("products.instagram.ai.backToPosts")}
      </Button>

      <ProductInstagramPostMediaPreview post={post} />

      <Space size={20}>
        <Text type="secondary">
          <HeartIcon size={18} /> {formatCompactNumber(post.like_count)}
        </Text>
        <Text type="secondary">
          <ChatCircleIcon size={18} />{" "}
          {formatCompactNumber(post.comments_count)}
        </Text>
      </Space>

      <Card size="small">
        <Flex vertical gap={8}>
          <Space>
            <InstagramLogoIcon size={20} />
            <Text type="secondary" strong>
              {t("products.instagram.ai.postCaptionTitle")}
            </Text>
          </Space>

          <Text>{caption || t("products.instagram.noCaption")}</Text>
        </Flex>
      </Card>

      {extraction ? (
        <ProductInstagramExtractionResult
          categoryOptions={categoryOptions}
          extraction={extraction}
          fillLoading={fillLoading}
          onFillProductForm={onFillProductForm}
        />
      ) : (
        <Card>
          <Flex vertical gap={16}>
            <Flex align="center" gap={12}>
              <Tag color="purple" icon={<SparkleIcon size={14} />}>
                {t("products.instagram.ai.tag")}
              </Tag>

              <Flex vertical>
                <Text strong>
                  {t("products.instagram.ai.analyzeCardTitle")}
                </Text>
                <Text type="secondary">
                  {t("products.instagram.ai.analyzeCardSubtitle")}
                </Text>
              </Flex>
            </Flex>

            <Button
              type="primary"
              size="large"
              block
              icon={<SparkleIcon size={18} />}
              loading={analyzeLoading}
              onClick={() => onAnalyzePost(post)}
            >
              {t("products.instagram.ai.analyzePostButton")}
            </Button>

            {analyzeError ? (
              <Alert type="error" showIcon message={analyzeError} />
            ) : null}
          </Flex>
        </Card>
      )}
    </Flex>
  );
};
