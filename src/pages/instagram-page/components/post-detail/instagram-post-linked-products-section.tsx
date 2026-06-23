import { TagIcon } from "@phosphor-icons/react";
import { Flex, Spin } from "antd";
import { useTranslation } from "react-i18next";

import type { InstagramMediaItem } from "@/features/instagram/model/instagram.types";

import type { InstagramPostPageController } from "../../controllers/use-instagram-post-page-controller";
import { InstagramLinkProductPicker } from "./instagram-link-product-picker";
import { InstagramPostProductsDetailedCard } from "./instagram-post-products-detailed-card";
import * as S from "./instagram-post-detail-content.styled";

type InstagramPostLinkedProductsSectionProps = {
  controller: InstagramPostPageController;
  post: InstagramMediaItem;
};

export const InstagramPostLinkedProductsSection = ({
  controller,
  post,
}: InstagramPostLinkedProductsSectionProps) => {
  const { t } = useTranslation();
  const { linkedProducts, productCount, linkedProductsSectionLoading } =
    controller;

  return (
    <Flex vertical gap={10}>
      <Flex align="center" justify="space-between" gap={16}>
        <S.SectionTitle>
          <TagIcon size={16} />
          {t("instagram.linkedProducts")}
          <S.CountBadge>{productCount}</S.CountBadge>
        </S.SectionTitle>
        <InstagramLinkProductPicker
          disabled={linkedProductsSectionLoading}
          permalink={post.permalink}
          postId={post.id}
        />
      </Flex>

      <Spin
        spinning={linkedProductsSectionLoading}
        description={t("instagram.updatingLinkedProducts")}
      >
        <S.ProductsBody>
          <InstagramPostProductsDetailedCard
            postId={post.id}
            products={linkedProducts}
          />
        </S.ProductsBody>
      </Spin>
    </Flex>
  );
};
