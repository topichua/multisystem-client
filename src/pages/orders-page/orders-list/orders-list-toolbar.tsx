import { FunnelSimpleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Badge, Button, Flex, Input, theme } from "antd";
import { Tag } from "@/components/tag/tag";
import { observer } from "mobx-react-lite";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { normalizeAppliedListKeyword } from "@/features/orders/model/orders-list-url";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import { BRAND_PRIMARY } from "@/styled/brand";
import { useIsMobileViewport } from "@/utils/use-media-query";

type OrdersListToolbarProps = {
  onToggleFilters: () => void;
};

export const OrdersListToolbar = observer(
  ({ onToggleFilters }: OrdersListToolbarProps) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const isMobileViewport = useIsMobileViewport();
    const ordersStore = useOrdersStore();
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

    if (isMobileViewport) {
      return (
        <Flex
          align="center"
          gap={8}
          style={{ marginBottom: 12, width: "100%" }}
        >
          <Input
            allowClear
            size="large"
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
              size="large"
              type="default"
              icon={<FunnelSimpleIcon size={18} />}
              aria-label={t("orders.mobile.filtersAria")}
              data-qa="orders-mobile-filters-trigger"
              onClick={onToggleFilters}
            />
          </Badge>
        </Flex>
      );
    }

    return (
      <Flex
        align="center"
        gap={16}
        wrap="wrap"
        style={{ marginBottom: 16, width: "100%" }}
      >
        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
          <Input
            allowClear
            size="large"
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
        <Button size="large" type="default" onClick={onToggleFilters}>
          <Flex align="center" gap={8}>
            <FunnelSimpleIcon size={18} />
            {t("orders.toolbar.filters")}
            {filterCount > 0 ? (
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
            ) : null}
          </Flex>
        </Button>
      </Flex>
    );
  },
);
