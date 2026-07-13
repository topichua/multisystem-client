import {
  CaretRightIcon,
  ClockCounterClockwiseIcon,
  FolderIcon,
  ListChecksIcon,
  PackageIcon,
} from '@phosphor-icons/react';
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { productsSectionNavItems } from "@/app/router/navigation";

import * as S from "./mobile-products-hub-page.styled.tsx";

type ProductsMobileItemKey = (typeof productsSectionNavItems)[number]["key"];

type ProductsMobilePresentation = {
  icon: ReactNode;
  descriptionKey: string;
};

const productsMobilePresentationByKey = {
  'products-list': {
    icon: <PackageIcon />,
    descriptionKey: 'products.mobile.descriptions.list',
  },
  'products-inventory-history': {
    icon: <ClockCounterClockwiseIcon />,
    descriptionKey: 'products.mobile.descriptions.inventoryHistory',
  },
  'products-categories': {
    icon: <FolderIcon />,
    descriptionKey: 'products.mobile.descriptions.categories',
  },
  'products-characteristics': {
    icon: <ListChecksIcon />,
    descriptionKey: 'products.mobile.descriptions.characteristics',
  },
} satisfies Record<ProductsMobileItemKey, ProductsMobilePresentation>;

export const MobileProductsHubPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <S.Root>
      <S.Header>
        <S.PageTitle level={3}>{t("products.shellTitle")}</S.PageTitle>
      </S.Header>

      <S.ListCard>
        {productsSectionNavItems.map((item) => {
          const presentation = productsMobilePresentationByKey[item.key];

          return (
            <S.ItemButton
              key={item.key}
              type="text"
              block
              data-qa={`products-mobile-hub-item-${item.key}`}
              onClick={() => navigate(item.path)}
            >
              <S.ItemContent align="center" gap={12}>
                <S.IconTile aria-hidden="true">{presentation.icon}</S.IconTile>
                <S.ItemCopy vertical gap={2}>
                  <S.ItemTitle>{t(item.labelKey)}</S.ItemTitle>
                  <S.ItemDescription>
                    {t(presentation.descriptionKey)}
                  </S.ItemDescription>
                </S.ItemCopy>
                <S.Caret aria-hidden="true">
                  <CaretRightIcon size={18} />
                </S.Caret>
              </S.ItemContent>
            </S.ItemButton>
          );
        })}
      </S.ListCard>
    </S.Root>
  );
};
