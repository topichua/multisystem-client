import { FunnelSimpleIcon } from "@phosphor-icons/react";
import {
  Button,
  DatePicker,
  Drawer,
  Flex,
  InputNumber,
  Typography,
  theme,
} from "antd";
import type { GlobalToken } from "antd/es/theme/interface";
import type { CSSProperties } from "react";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import {
  ORDER_SOURCE_FILTER_VALUES,
  type OrderSourceFilter,
} from "@/features/orders/model/order-list.constants";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import { BRAND_PRIMARY } from "@/styled/brand";

const { Text } = Typography;

function getFilterPillStyle(
  checked: boolean,
  token: GlobalToken,
): CSSProperties {
  return {
    margin: 0,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    borderRadius: 999,
    border: `1px solid ${checked ? BRAND_PRIMARY : token.colorBorderSecondary}`,
    background: "transparent",
    color: token.colorText,
    cursor: "pointer",
    font: "inherit",
    lineHeight: 1.4,
  };
}

type OrdersListFiltersPanelProps = {
  open: boolean;
  onClose: () => void;
};

export const OrdersListFiltersPanel = observer(
  ({ open, onClose }: OrdersListFiltersPanelProps) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const ordersStore = useOrdersStore();
    const filtersPanelWasOpenRef = useRef(false);

    const sortedStatuses = useMemo(
      () => [...ordersStore.statuses].sort((a, b) => a.sortOrder - b.sortOrder),
      [ordersStore.statuses],
    );

    const appliedStatusKey = useMemo(
      () => [...ordersStore.listStatusIds].sort((a, b) => a - b).join(","),
      [ordersStore.listStatusIds],
    );

    const appliedSourcesKey = useMemo(
      () => [...ordersStore.listSources].sort().join(","),
      [ordersStore.listSources],
    );

    useEffect(() => {
      if (!open) {
        filtersPanelWasOpenRef.current = false;
        return;
      }

      ordersStore.syncFilterDraftFromApplied();
      filtersPanelWasOpenRef.current = true;
    }, [
      open,
      ordersStore,
      appliedStatusKey,
      appliedSourcesKey,
      ordersStore.listTotalPriceFrom,
      ordersStore.listTotalPriceTo,
      ordersStore.listCreatedFrom,
      ordersStore.listCreatedTo,
    ]);

    const toggleStatus = (statusId: number, checked: boolean): void => {
      const next = new Set(ordersStore.draftStatusIds);
      if (checked) {
        next.add(statusId);
      } else {
        next.delete(statusId);
      }
      ordersStore.setDraftStatusIds([...next]);
    };

    const toggleSource = (
      source: OrderSourceFilter,
      checked: boolean,
    ): void => {
      const next = new Set(ordersStore.draftSources);
      if (checked) {
        next.add(source);
      } else {
        next.delete(source);
      }
      ordersStore.setDraftSources([...next]);
    };

    return (
      <Drawer
        title={t("orders.toolbar.filters")}
        open={open}
        placement="right"
        size="auto"
        onClose={onClose}
        destroyOnHidden
        styles={{
          body: {
            padding: 16,
            overflowY: "auto",
          },
          footer: {
            padding: 16,
          },
        }}
        footer={
          <Flex gap={8}>
            <Button
              style={{ flex: 1 }}
              onClick={() => ordersStore.resetFilterDraft()}
            >
              {t("orders.listFilters.panelClear")}
            </Button>
            <Button
              type="primary"
              style={{ flex: 1 }}
              icon={<FunnelSimpleIcon size={16} />}
              onClick={() => {
                ordersStore.applyFiltersFromPanel();
                onClose();
              }}
            >
              {t("orders.listFilters.panelApply")}
            </Button>
          </Flex>
        }
      >
        <Flex vertical gap={20} style={{ width: 360, maxWidth: "80vw" }}>
          <div>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              {t("orders.listFilters.panelStatusSection")}
            </Text>
            <Flex gap={8} wrap="wrap">
              {sortedStatuses.map((status) => {
                const checked = ordersStore.draftStatusIds.includes(status.id);
                return (
                  <button
                    key={status.id}
                    type="button"
                    onClick={() => toggleStatus(status.id, !checked)}
                    style={getFilterPillStyle(checked, token)}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: status.color,
                        flexShrink: 0,
                      }}
                    />
                    {status.name}
                  </button>
                );
              })}
            </Flex>
          </div>

          <div>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              {t("orders.listFilters.panelSourceSection")}
            </Text>
            <Flex gap={8} wrap="wrap">
              {ORDER_SOURCE_FILTER_VALUES.map((source) => {
                const checked = ordersStore.draftSources.includes(source);
                return (
                  <button
                    key={source}
                    type="button"
                    onClick={() => toggleSource(source, !checked)}
                    style={getFilterPillStyle(checked, token)}
                  >
                    {t(`orders.sources.${source}`, { defaultValue: source })}
                  </button>
                );
              })}
            </Flex>
          </div>

          <div>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              {t("orders.listFilters.panelTotalSection")}
            </Text>
            <Flex gap={8} align="center">
              <InputNumber
                style={{ flex: 1, minWidth: 0 }}
                placeholder={t("orders.listFilters.panelTotalFrom")}
                value={ordersStore.draftTotalPriceFrom ?? undefined}
                onChange={(value) => {
                  if (value == null) {
                    ordersStore.setDraftTotalPriceFrom(null);
                  } else {
                    ordersStore.setDraftTotalPriceFrom(Number(value));
                  }
                }}
              />
              <span>-</span>
              <InputNumber
                style={{ flex: 1, minWidth: 0 }}
                placeholder={t("orders.listFilters.panelTotalTo")}
                value={ordersStore.draftTotalPriceTo ?? undefined}
                onChange={(value) => {
                  if (value == null) {
                    ordersStore.setDraftTotalPriceTo(null);
                  } else {
                    ordersStore.setDraftTotalPriceTo(Number(value));
                  }
                }}
              />
            </Flex>
          </div>

          <div>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              {t("orders.listFilters.panelCreatedSection")}
            </Text>
            <Flex gap={8} align="center">
              <DatePicker
                style={{ flex: 1, minWidth: 0 }}
                placeholder={t("orders.listFilters.panelCreatedFrom")}
                value={
                  ordersStore.draftCreatedFrom
                    ? dayjs(ordersStore.draftCreatedFrom)
                    : null
                }
                onChange={(value) => {
                  ordersStore.setDraftCreatedFrom(
                    value ? value.format("YYYY-MM-DD") : null,
                  );
                }}
              />
              <span>–</span>
              <DatePicker
                style={{ flex: 1, minWidth: 0 }}
                placeholder={t("orders.listFilters.panelCreatedTo")}
                value={
                  ordersStore.draftCreatedTo
                    ? dayjs(ordersStore.draftCreatedTo)
                    : null
                }
                onChange={(value) => {
                  ordersStore.setDraftCreatedTo(
                    value ? value.format("YYYY-MM-DD") : null,
                  );
                }}
              />
            </Flex>
          </div>
        </Flex>
      </Drawer>
    );
  },
);
