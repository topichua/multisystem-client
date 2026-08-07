import {
  ExportIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { Badge, Button, Flex, Input, theme } from "antd";
import { Tag } from "@/components/tag/tag";
import { observer } from "mobx-react-lite";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { normalizeAppliedListKeyword } from "@/features/orders/model/orders-list-url";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import { BRAND_PRIMARY } from "@/styled/brand";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { OrdersExportModal } from "./orders-export-modal";
import {
  useOrdersExport,
  type OrdersExportController,
} from "./use-orders-export";

type OrdersListToolbarProps = {
  onToggleFilters: () => void;
};

export const OrdersListToolbar = observer(
  ({ onToggleFilters }: OrdersListToolbarProps) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const isMobileViewport = useIsMobileViewport();
    const ordersStore = useOrdersStore();
    const ordersExport: OrdersExportController = useOrdersExport();
    const [keywordDraft, setKeywordDraft] = useState(
      () => ordersStore.listKeyword,
    );
    const searchFocused = useRef(false);

    useLayoutEffect(() => {
      if (!searchFocused.current) {
        setKeywordDraft(ordersStore.listKeyword);
      }
    }, [ordersStore.listKeyword]);

    useEffect(() => {
      const id = window.setTimeout(() => {
        const nextApplied = normalizeAppliedListKeyword(keywordDraft);
        if (nextApplied !== ordersStore.listKeyword) {
          ordersStore.setListKeyword(keywordDraft);
        }
      }, 350);
      return () => window.clearTimeout(id);
    }, [keywordDraft, ordersStore, ordersStore.listKeyword]);

    const filterCount = ordersStore.appliedNonKeywordFilterCount;

    const exportModal = (
      <OrdersExportModal
        open={ordersExport.open}
        submitting={ordersExport.submitting}
        onCancel={ordersExport.closeModal}
        onSubmit={(values) => {
          void ordersExport.submit(values);
        }}
      />
    );

    if (isMobileViewport) {
      return (
        <>
          <Flex
            align="center"
            gap={8}
            style={{ marginBottom: 12, width: "100%" }}
          >
            <Input
              allowClear
              placeholder={t("orders.toolbar.searchPlaceholder")}
              aria-label={t("orders.mobile.searchAria")}
              prefix={<MagnifyingGlassIcon size={18} />}
              value={keywordDraft}
              onFocus={() => {
                searchFocused.current = true;
              }}
              onBlur={() => {
                searchFocused.current = false;
              }}
              onChange={(event) => setKeywordDraft(event.target.value)}
              style={{ flex: "1 1 auto", minWidth: 0 }}
            />
            <Badge count={filterCount > 0 ? filterCount : 0} size="small">
              <Button
                type="default"
                icon={<FunnelSimpleIcon size={18} />}
                aria-label={t("orders.mobile.filtersAria")}
                data-qa="orders-mobile-filters-trigger"
                onClick={onToggleFilters}
              />
            </Badge>
            <Button
              type="default"
              icon={<ExportIcon size={18} />}
              aria-label={t("orders.toolbar.export")}
              data-qa="orders-mobile-export"
              onClick={ordersExport.openModal}
            />
          </Flex>
          {exportModal}
        </>
      );
    }

    return (
      <>
        <Flex
          align="center"
          gap={16}
          wrap="wrap"
          style={{ marginBottom: 16, width: "100%" }}
        >
          <div style={{ flex: "1 1 200px", minWidth: 0 }}>
            <Input
              allowClear
              placeholder={t("orders.toolbar.searchPlaceholder")}
              prefix={<MagnifyingGlassIcon size={18} />}
              value={keywordDraft}
              onFocus={() => {
                searchFocused.current = true;
              }}
              onBlur={() => {
                searchFocused.current = false;
              }}
              onChange={(event) => setKeywordDraft(event.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <Button type="default" onClick={onToggleFilters}>
            <Flex align="center" gap={8}>
              <FunnelSimpleIcon size={18} />
              {t("orders.toolbar.filters")}
              {filterCount > 0 && (
                <Tag
                  style={{
                    margin: 0,
                    lineHeight: "20px",
                    paddingInline: 8,
                    background: BRAND_PRIMARY,
                    color: token.colorTextLightSolid,
                    border: "none",
                  }}
                >
                  {filterCount}
                </Tag>
              )}
            </Flex>
          </Button>
          <Button
            type="default"
            icon={<ExportIcon size={18} />}
            data-qa="orders-list-export"
            onClick={ordersExport.openModal}
          >
            {t("orders.toolbar.export")}
          </Button>
        </Flex>
        {exportModal}
      </>
    );
  },
);
