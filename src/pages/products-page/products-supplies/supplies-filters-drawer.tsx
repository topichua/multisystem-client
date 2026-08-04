import { FunnelSimpleIcon } from "@phosphor-icons/react";
import { Button, DatePicker, Drawer, Flex, InputNumber, Select } from "antd";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { formatCatalogVariantCurrency } from "@/features/products/utils/catalog-variant-display";
import type { WorkspaceMember } from "@/features/workspace-members/model/workspace-member.types";
import { getWorkspaceMemberName } from "@/features/workspace-members/utils/workspace-member-display";
import { useWorkspaceSettingsStore } from "@/features/workspace-settings/model/use-workspace-settings-store";
import { formatApiDate } from "@/utils/date-time";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { SuppliesFilterField } from "./supplies-filter-field";
import type { SuppliesPanelFilters } from "./supplies-filters.constants";

const rangeControlStyle = { flex: 1, minWidth: 0, width: "100%" as const };

type SuppliesFiltersDrawerProps = {
  open: boolean;
  draftFilters: SuppliesPanelFilters;
  members: WorkspaceMember[];
  onClose: () => void;
  onDraftChange: (filters: SuppliesPanelFilters) => void;
  onResetDraft: () => void;
  onApply: () => void;
};

export const SuppliesFiltersDrawer = observer(
  ({
    open,
    draftFilters,
    members,
    onClose,
    onDraftChange,
    onResetDraft,
    onApply,
  }: SuppliesFiltersDrawerProps) => {
    const { t } = useTranslation();
    const isMobileViewport = useIsMobileViewport();
    const workspaceSettingsStore = useWorkspaceSettingsStore();
    const currencySymbol = formatCatalogVariantCurrency(
      workspaceSettingsStore.currency ?? "UAH",
    );

    const memberOptions = useMemo(
      () => [
        {
          value: null,
          label: t("products.supplies.filters.allManagers"),
        },
        ...members.map((member) => ({
          value: member.user.id,
          label: getWorkspaceMemberName(member),
        })),
      ],
      [members, t],
    );

    const updateDraft = (patch: Partial<SuppliesPanelFilters>) => {
      onDraftChange({ ...draftFilters, ...patch });
    };

    return (
      <Drawer
        title={t("products.supplies.filters.title")}
        closable={{ placement: "end" }}
        open={open}
        placement={isMobileViewport ? "bottom" : "right"}
        size={isMobileViewport ? undefined : 420}
        height={isMobileViewport ? "auto" : undefined}
        onClose={onClose}
        destroyOnHidden
        data-qa="products-supplies-filters-drawer"
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
              {t("products.supplies.filters.clear")}
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
              {t("products.supplies.filters.apply")}
            </Button>
          </Flex>
        }
      >
        <Flex vertical gap={20}>
          <SuppliesFilterField label={t("products.supplies.filters.createdBy")}>
            <Select
              style={{ width: "100%" }}
              options={memberOptions}
              value={draftFilters.createdBy ?? null}
              onChange={(value: number | null) =>
                updateDraft({ createdBy: value ?? undefined })
              }
            />
          </SuppliesFilterField>

          <SuppliesFilterField label={t("products.supplies.filters.period")}>
            <Flex gap={8} align="center">
              <DatePicker
                style={rangeControlStyle}
                format="DD.MM.YYYY"
                placeholder={t("products.supplies.filters.datePlaceholder")}
                value={
                  draftFilters.createdFrom
                    ? dayjs(draftFilters.createdFrom)
                    : null
                }
                onChange={(value) =>
                  updateDraft({
                    createdFrom: value ? formatApiDate(value) : undefined,
                  })
                }
              />
              <span>—</span>
              <DatePicker
                style={rangeControlStyle}
                format="DD.MM.YYYY"
                placeholder={t("products.supplies.filters.datePlaceholder")}
                value={
                  draftFilters.createdTo ? dayjs(draftFilters.createdTo) : null
                }
                onChange={(value) =>
                  updateDraft({
                    createdTo: value ? formatApiDate(value) : undefined,
                  })
                }
              />
            </Flex>
          </SuppliesFilterField>

          <SuppliesFilterField
            label={t("products.supplies.filters.sum", {
              currency: currencySymbol,
            })}
          >
            <Flex gap={8} align="center">
              <InputNumber
                style={rangeControlStyle}
                min={0}
                placeholder={t("products.supplies.filters.sumFrom")}
                value={draftFilters.totalSumFrom}
                onChange={(value) =>
                  updateDraft({
                    totalSumFrom: typeof value === "number" ? value : undefined,
                  })
                }
              />
              <span>—</span>
              <InputNumber
                style={rangeControlStyle}
                min={0}
                placeholder={t("products.supplies.filters.sumTo")}
                value={draftFilters.totalSumTo}
                onChange={(value) =>
                  updateDraft({
                    totalSumTo: typeof value === "number" ? value : undefined,
                  })
                }
              />
            </Flex>
          </SuppliesFilterField>
        </Flex>
      </Drawer>
    );
  },
);
