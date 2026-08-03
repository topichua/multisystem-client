import { FunnelSimpleIcon } from "@phosphor-icons/react";
import { Badge, Button, Flex, Segmented } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { StockSupplyListBy } from "@/features/inventory/model/inventory.types";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { getSuppliesStatusTabLabel } from "./products-supplies.utils";
import {
  SUPPLIES_STATUS_TABS,
  type SuppliesStatusCounts,
} from "./supplies-filters.constants";

type SuppliesToolbarProps = {
  by: StockSupplyListBy;
  statusCounts: SuppliesStatusCounts;
  filterCount: number;
  onByChange: (by: StockSupplyListBy) => void;
  onOpenFilters: () => void;
};

export const SuppliesToolbar = ({
  by,
  statusCounts,
  filterCount,
  onByChange,
  onOpenFilters,
}: SuppliesToolbarProps) => {
  const { t } = useTranslation();
  const isMobileViewport = useIsMobileViewport();

  const statusOptions = useMemo(
    () =>
      SUPPLIES_STATUS_TABS.map((tab) => ({
        value: tab,
        label: `${getSuppliesStatusTabLabel(tab, t)} ${statusCounts[tab]}`,
      })),
    [statusCounts, t],
  );

  return (
    <Flex
      align="center"
      justify="space-between"
      gap={isMobileViewport ? 8 : 16}
      wrap="wrap"
      style={{ width: "100%" }}
    >
      <Segmented<StockSupplyListBy>
        value={by}
        options={statusOptions}
        aria-label={t("products.supplies.tabs.aria")}
        data-qa="products-supplies-status-tabs"
        onChange={onByChange}
      />

      <Badge count={filterCount > 0 ? filterCount : 0} size="small">
        <Button
          type="default"
          icon={<FunnelSimpleIcon size={18} />}
          aria-label={t("products.supplies.filters.openAria")}
          data-qa="products-supplies-filters-trigger"
          onClick={onOpenFilters}
        >
          {isMobileViewport ? null : t("products.supplies.filters.title")}
        </Button>
      </Badge>
    </Flex>
  );
};
