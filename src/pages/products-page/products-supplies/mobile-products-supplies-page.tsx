import { ArrowLeftIcon, CubeIcon } from "@phosphor-icons/react";
import { Empty, Flex, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { ProductsTablePagination } from "@/pages/products-page/products-list/list/products-table-pagination";

import { useProductsSuppliesPage } from "./hooks/use-products-supplies-page";
import * as S from "./mobile-products-supplies-page.styled";
import { SuppliesMobileCard } from "./supplies-mobile-card";
import { SuppliesPageOverlays } from "./supplies-page-overlays";
import { SuppliesToolbar } from "./supplies-toolbar";

export const MobileProductsSuppliesPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const page = useProductsSuppliesPage();

  return (
    <S.Root>
      <S.Header>
        <S.TitleRow>
          <S.BackButton
            type="text"
            icon={<ArrowLeftIcon size={20} />}
            aria-label={t("products.mobile.backToProductsAria")}
            data-qa="products-mobile-supplies-back"
            onClick={() => navigate(pagesMap.products)}
          />
          <S.PageTitle level={3}>{t("products.suppliesTitle")}</S.PageTitle>
        </S.TitleRow>
        <S.HeaderActions>
          <S.CreateButton
            icon={<CubeIcon size={16} />}
            aria-label={t("products.addSupplyCta")}
            data-qa="products-mobile-supplies-add-supply"
            onClick={page.openStockSupplyModal}
          >
            <S.CreateButtonLabel>
              {t("products.addSupplyCta")}
            </S.CreateButtonLabel>
          </S.CreateButton>
        </S.HeaderActions>
      </S.Header>

      {page.showInitialSpinner ? (
        <S.Content>
          <CenteredSpinner />
        </S.Content>
      ) : (
        <Flex vertical gap={12}>
          <SuppliesToolbar
            by={page.by}
            statusCounts={page.statusCounts}
            filterCount={page.appliedFilterCount}
            onByChange={page.onByChange}
            onOpenFilters={page.openFilters}
          />

          {page.error && <S.ErrorText type="danger">{page.error}</S.ErrorText>}

          <Spin spinning={page.loading}>
            {page.items.length === 0 ? (
              <Empty description={t("products.supplies.emptyState")} />
            ) : (
              <Flex vertical gap={12}>
                {page.items.map((item) => (
                  <SuppliesMobileCard key={item.id} item={item} />
                ))}
              </Flex>
            )}
          </Spin>

          <ProductsTablePagination
            current={page.page}
            pageSize={page.pageSize}
            total={page.total}
            onChange={page.onPageChange}
          />
        </Flex>
      )}

      <SuppliesPageOverlays
        filtersOpen={page.filtersOpen}
        draftFilters={page.draftFilters}
        members={page.members}
        onCloseFilters={page.closeFilters}
        onDraftChange={page.setDraftFilters}
        onResetDraft={page.resetDraftFilters}
        onApplyFilters={page.applyDraftFilters}
        stockSupplyModalOpen={page.stockSupplyModalOpen}
        onCloseStockSupplyModal={page.closeStockSupplyModal}
        onStockSupplySuccess={page.reload}
      />
    </S.Root>
  );
});
