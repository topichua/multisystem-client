import {
  ArrowLeftIcon,
  CaretRightIcon,
  ListChecksIcon,
  PlusIcon,
  TextTIcon,
} from "@phosphor-icons/react";
import { Empty, Flex, Tag } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useNavigate, useOutletContext } from "react-router";

import { getProductCharacteristicPath, pagesMap } from "@/app/router/pages-map";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { useCharacteristicsStore } from "@/features/characteristics/model/use-characteristics-store";

import type { ProductsCharacteristicsOutletContext } from "../products-characteristics-layout";
import * as S from "./mobile-characteristics-list-page.styled";

export const MobileCharacteristicsListPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const store = useCharacteristicsStore();
  const {
    onCreateClick,
    searchValue,
    setSearchValue,
    visibleCharacteristics,
    totalCount,
  } = useOutletContext<ProductsCharacteristicsOutletContext>();

  const emptyDescription =
    totalCount === 0
      ? t("characteristics.emptyState")
      : t("characteristics.emptySearch");

  return (
    <S.Root>
      <S.Header>
        <S.HeaderTopRow>
          <S.TitleRow>
            <S.BackButton
              type="text"
              icon={<ArrowLeftIcon size={20} />}
              aria-label={t("products.mobile.backToProductsAria")}
              data-qa="products-mobile-characteristics-back"
              onClick={() => navigate(pagesMap.products)}
            />
            <S.TitleCopy>
              <S.PageTitle level={3}>{t("characteristics.title")}</S.PageTitle>
              <S.PageSubtitle>
                {t("characteristics.itemsCount", { count: totalCount })}
              </S.PageSubtitle>
            </S.TitleCopy>
          </S.TitleRow>
          <S.CreateButton
            type="primary"
            icon={<PlusIcon />}
            aria-label={t("characteristics.mobile.createCharacteristicAria")}
            data-qa="products-mobile-characteristics-create"
            onClick={onCreateClick}
          >
            <S.CreateButtonLabel>
              {t("characteristics.createCharacteristic")}
            </S.CreateButtonLabel>
          </S.CreateButton>
        </S.HeaderTopRow>

        <S.SearchInput
          allowClear
          placeholder={t("characteristics.searchPlaceholder")}
          aria-label={t("characteristics.searchPlaceholder")}
          value={searchValue}
          data-qa="products-mobile-characteristics-search"
          onChange={(event) => setSearchValue(event.target.value)}
        />
      </S.Header>

      {store.listLoading && totalCount === 0 ? (
        <S.StateContainer>
          <CenteredSpinner minHeight={160} />
        </S.StateContainer>
      ) : visibleCharacteristics.length === 0 ? (
        <S.StateContainer>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={emptyDescription}
          />
        </S.StateContainer>
      ) : (
        <S.ListCard>
          {visibleCharacteristics.map((characteristic) => {
            const isArchived = characteristic.archivedAt != null;
            const optionsCount = characteristic.options?.length ?? 0;
            const metaLabel =
              characteristic.type === "options"
                ? t("characteristics.optionsCount", { count: optionsCount })
                : t("characteristics.typeText");

            return (
              <S.CharacteristicItemButton
                key={characteristic.id}
                type="text"
                block
                data-qa={`products-mobile-characteristic-item-${characteristic.id}`}
                aria-label={characteristic.label}
                onClick={() =>
                  navigate(getProductCharacteristicPath(characteristic.id))
                }
              >
                <S.ItemContent align="center" gap={12}>
                  <S.IconTile aria-hidden="true">
                    {characteristic.type === "options" ? (
                      <ListChecksIcon />
                    ) : (
                      <TextTIcon />
                    )}
                  </S.IconTile>
                  <S.ItemCopy vertical gap={2}>
                    <Flex align="center" gap={8} style={{ minWidth: 0 }}>
                      <S.ItemTitle $archived={isArchived}>
                        {characteristic.label}
                      </S.ItemTitle>
                      {isArchived && (
                        <Tag style={{ marginInlineEnd: 0, flexShrink: 0 }}>
                          {t("characteristics.archivedBadge")}
                        </Tag>
                      )}
                    </Flex>
                    <S.ItemMeta>{metaLabel}</S.ItemMeta>
                  </S.ItemCopy>
                  <S.Caret aria-hidden="true">
                    <CaretRightIcon size={18} />
                  </S.Caret>
                </S.ItemContent>
              </S.CharacteristicItemButton>
            );
          })}
        </S.ListCard>
      )}
    </S.Root>
  );
});
