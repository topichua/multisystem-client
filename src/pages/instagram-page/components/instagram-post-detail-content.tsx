import {
  ArrowSquareOutIcon,
  ChatCircleIcon,
  HeartIcon,
  MagicWandIcon,
  TagIcon,
} from "@phosphor-icons/react";
import { Alert, Button, Flex, Spin, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { InstagramLogoIcon } from "@/components/icons/instagram/instagram-logo-icon";
import type {
  InstagramIntegration,
  InstagramMediaItem,
} from "@/features/instagram/model/instagram.types";

import type { InstagramPostPageController } from "../controllers/use-instagram-post-page-controller";
import * as S from "../instagram-page.styled";
import {
  formatCompactNumber,
  formatHandle,
  formatPostDate,
} from "../utils/instagram-page-format";
import { InstagramLinkProductPicker } from "./instagram-link-product-picker";
import { InstagramPostMediaPreview } from "./instagram-post-media-preview";
import { InstagramPostProductsTable } from "./instagram-post-products-table";

const { Paragraph, Text, Title } = Typography;

type InstagramPostDetailContentProps = {
  controller: InstagramPostPageController;
  post: InstagramMediaItem;
  selectedIntegration: InstagramIntegration;
};

export const InstagramPostDetailContent = ({
  controller,
  post,
  selectedIntegration,
}: InstagramPostDetailContentProps) => {
  const { t } = useTranslation();
  const {
    store,
    linkedProducts,
    productCount,
    productVariantsLoading,
    linkedProductsSectionLoading,
  } = controller;

  return (
    <S.PostDetailContent>
      {store.postProductVariantsError ? (
        <Alert
          type="warning"
          showIcon
          title={store.postProductVariantsError}
          style={{ marginBottom: 16 }}
        />
      ) : null}

      <Spin spinning={productVariantsLoading}>
        <Flex vertical gap={24}>
          <Flex align="center" justify="space-between" gap={16}>
            <Flex align="center" gap={12}>
              <InstagramLogoIcon size={40} />

              <Flex vertical gap={0}>
                <Title level={4} style={{ margin: 0 }}>
                  {formatHandle(selectedIntegration.name)}
                </Title>
                <Text type="secondary">{formatPostDate(post.timestamp)}</Text>
              </Flex>
            </Flex>

            {post.permalink ? (
              <Button
                type="text"
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('instagram.openOnInstagram')}
                <ArrowSquareOutIcon size={18} />
              </Button>
            ) : null}
          </Flex>

          <S.PostDetailSummary>
            <S.PostDetailMediaPreview>
              <InstagramPostMediaPreview post={post} />
            </S.PostDetailMediaPreview>

            <Flex vertical gap={12}>
              <Flex align="center" gap={24} wrap="wrap">
                <S.PostDetailMetric>
                  <HeartIcon size={18} />
                  <Text strong>{formatCompactNumber(post.like_count)}</Text>
                </S.PostDetailMetric>
                <S.PostDetailMetric>
                  <ChatCircleIcon size={18} />
                  <Text strong>{formatCompactNumber(post.comments_count)}</Text>
                </S.PostDetailMetric>
              </Flex>

              <Text type="secondary">{formatPostDate(post.timestamp)}</Text>
            </Flex>
          </S.PostDetailSummary>

          <Flex vertical gap={10}>
            <Flex align="center" justify="space-between" gap={16}>
              <S.PostDetailSectionTitle>
                {t('instagram.postDescription')}
              </S.PostDetailSectionTitle>
              <Button icon={<MagicWandIcon size={16} />}>
                {t('instagram.composeWithAi')}
              </Button>
            </Flex>

            <S.PostDescriptionBox>
              <Paragraph style={{ margin: 0 }}>
                {post.caption?.trim() || t('instagram.noCaption')}
              </Paragraph>
            </S.PostDescriptionBox>

            <Text type="secondary">{t('instagram.aiDescriptionHint')}</Text>
          </Flex>

          <Flex vertical gap={10}>
            <Flex align="center" justify="space-between" gap={16}>
              <S.PostDetailSectionTitle>
                <TagIcon size={16} />
                {t('instagram.linkedProducts')}
                <S.FilterCount>{productCount}</S.FilterCount>
              </S.PostDetailSectionTitle>
              <InstagramLinkProductPicker
                disabled={linkedProductsSectionLoading}
                permalink={post.permalink}
                postId={post.id}
              />
            </Flex>

            <Spin
              spinning={linkedProductsSectionLoading}
              tip={t('instagram.updatingLinkedProducts')}
            >
              <div style={{ minHeight: 120 }}>
                <InstagramPostProductsTable
                  postId={post.id}
                  products={linkedProducts}
                />
              </div>
            </Spin>
          </Flex>
        </Flex>
      </Spin>
    </S.PostDetailContent>
  );
};
