import { FunnelSimpleIcon } from "@phosphor-icons/react";
import {
  Button,
  DatePicker,
  Drawer,
  Flex,
  Select,
  Typography,
  theme,
} from "antd";
import type { GlobalToken } from "antd/es/theme/interface";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useMemo, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { WorkspaceMember } from "@/features/workspace-members/model/workspace-member.types";
import { getWorkspaceMemberName } from "@/features/workspace-members/utils/workspace-member-display";
import {
  getMovementTitle,
} from "@/features/products/components/product-inventory-drawer/product-inventory-movements-history/product-inventory-movements-history.utils";
import { BRAND_PRIMARY } from "@/styled/brand";
import { formatApiDate } from "@/utils/date-time";
import { useIsMobileViewport } from "@/utils/use-media-query";

import {
  INVENTORY_HISTORY_FILTER_TYPE_OPTIONS,
  type InventoryHistoryPanelFilters,
} from "./inventory-history-filters.constants";

const { Text } = Typography;

function getFilterPillStyle(
  checked: boolean,
  token: GlobalToken,
): CSSProperties {
  return {
    margin: 0,
    display: "inline-flex",
    alignItems: "center",
    padding: "5px 12px",
    borderRadius: 999,
    border: `1px solid ${checked ? BRAND_PRIMARY : token.colorBorderSecondary}`,
    background: checked ? token.colorPrimaryBg : "transparent",
    color: token.colorText,
    cursor: "pointer",
    font: "inherit",
    lineHeight: 1.4,
  };
}

type InventoryHistoryFiltersDrawerProps = {
  open: boolean;
  draftFilters: InventoryHistoryPanelFilters;
  members: WorkspaceMember[];
  onClose: () => void;
  onDraftChange: (filters: InventoryHistoryPanelFilters) => void;
  onResetDraft: () => void;
  onApply: () => void;
};

export const InventoryHistoryFiltersDrawer = observer(
  ({
    open,
    draftFilters,
    members,
    onClose,
    onDraftChange,
    onResetDraft,
    onApply,
  }: InventoryHistoryFiltersDrawerProps) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const isMobileViewport = useIsMobileViewport();

    const memberOptions = useMemo(
      () => [
        {
          value: null,
          label: t("products.inventoryHistory.filters.allManagers"),
        },
        ...members.map((member) => ({
          value: member.user.id,
          label: getWorkspaceMemberName(member),
        })),
      ],
      [members, t],
    );

    const updateDraft = (patch: Partial<InventoryHistoryPanelFilters>) => {
      onDraftChange({ ...draftFilters, ...patch });
    };

    const content = (
      <Flex vertical gap={20}>
        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            {t("products.inventoryHistory.filters.movementType")}
          </Text>
          <Flex gap={8} wrap="wrap">
            {INVENTORY_HISTORY_FILTER_TYPE_OPTIONS.map((option) => {
              const checked = (draftFilters.type ?? null) === option.value;

              return (
                <button
                  key={option.value ?? "all"}
                  type="button"
                  style={getFilterPillStyle(checked, token)}
                  onClick={() =>
                    updateDraft({
                      type: option.value ?? undefined,
                    })
                  }
                >
                  {option.badgeKey
                    ? getMovementTitle(option.badgeKey, t)
                    : t("products.inventoryHistory.filters.types.all")}
                </button>
              );
            })}
          </Flex>
        </div>

        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            {t("products.inventoryHistory.filters.period")}
          </Text>
          <Flex gap={8} align="center">
            <DatePicker
              style={{ flex: 1, minWidth: 0 }}
              format="DD.MM.YYYY"
              placeholder={t("products.inventoryHistory.filters.dateFrom")}
              value={draftFilters.from ? dayjs(draftFilters.from) : null}
              onChange={(value) =>
                updateDraft({
                  from: value ? formatApiDate(value) : undefined,
                })
              }
            />
            <span>-</span>
            <DatePicker
              style={{ flex: 1, minWidth: 0 }}
              format="DD.MM.YYYY"
              placeholder={t("products.inventoryHistory.filters.dateTo")}
              value={draftFilters.to ? dayjs(draftFilters.to) : null}
              onChange={(value) =>
                updateDraft({
                  to: value ? formatApiDate(value) : undefined,
                })
              }
            />
          </Flex>
        </div>

        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            {t("products.inventoryHistory.filters.manager")}
          </Text>
          <Select
            style={{ width: "100%" }}
            options={memberOptions}
            value={draftFilters.userId ?? null}
            onChange={(value: number | null) =>
              updateDraft({
                userId: value ?? undefined,
              })
            }
          />
        </div>
      </Flex>
    );

    return (
      <Drawer
        title={t("products.inventoryHistory.filters.title")}
        open={open}
        placement={isMobileViewport ? "bottom" : "right"}
        size={isMobileViewport ? undefined : 420}
        height={isMobileViewport ? "auto" : undefined}
        onClose={onClose}
        destroyOnHidden
        data-qa="products-inventory-history-filters-drawer"
        styles={{
          body: {
            padding: 16,
            overflowY: "auto",
            maxHeight: isMobileViewport ? "min(70vh, 560px)" : undefined,
          },
          footer: {
            padding: isMobileViewport
              ? "12px 16px calc(12px + env(safe-area-inset-bottom, 0px))"
              : 16,
          },
        }}
        footer={
          <Flex gap={8}>
            <Button style={{ flex: 1 }} onClick={onResetDraft}>
              {t("products.inventoryHistory.filters.clear")}
            </Button>
            <Button
              type="primary"
              style={{ flex: 1 }}
              icon={<FunnelSimpleIcon size={16} />}
              onClick={() => {
                onApply();
                onClose();
              }}
            >
              {t("products.inventoryHistory.filters.apply")}
            </Button>
          </Flex>
        }
      >
        {content}
      </Drawer>
    );
  },
);
