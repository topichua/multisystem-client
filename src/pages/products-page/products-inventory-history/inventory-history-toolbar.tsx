import { FunnelSimpleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Badge, Button, Flex, Input, theme } from "antd";
import { Tag } from "@/components/tag/tag";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { BRAND_PRIMARY } from "@/styled/brand";
import { useIsMobileViewport } from "@/utils/use-media-query";

type InventoryHistoryToolbarProps = {
  keyword: string;
  filterCount: number;
  onKeywordChange: (keyword: string) => void;
  onOpenFilters: () => void;
};

export const InventoryHistoryToolbar = ({
  keyword,
  filterCount,
  onKeywordChange,
  onOpenFilters,
}: InventoryHistoryToolbarProps) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const isMobileViewport = useIsMobileViewport();
  const [keywordDraft, setKeywordDraft] = useState(keyword);
  const searchFocused = useRef(false);

  useLayoutEffect(() => {
    if (!searchFocused.current) {
      setKeywordDraft(keyword);
    }
  }, [keyword]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const nextKeyword = keywordDraft.trim();

      if (nextKeyword !== keyword) {
        onKeywordChange(nextKeyword);
      }
    }, 350);

    return () => window.clearTimeout(id);
  }, [keyword, keywordDraft, onKeywordChange]);

  const filtersButton = isMobileViewport ? (
    <Badge count={filterCount > 0 ? filterCount : 0} size="small">
      <Button
        size="large"
        type="default"
        icon={<FunnelSimpleIcon size={18} />}
        aria-label={t("products.inventoryHistory.filters.openAria")}
        data-qa="products-inventory-history-filters-trigger"
        onClick={onOpenFilters}
      />
    </Badge>
  ) : (
    <Button size="large" type="default" onClick={onOpenFilters}>
      <Flex align="center" gap={8}>
        <FunnelSimpleIcon size={18} />
        {t("products.inventoryHistory.filters.title")}
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
  );

  return (
    <Flex
      align="center"
      gap={isMobileViewport ? 8 : 16}
      style={{ marginBottom: 16, width: "100%" }}
    >
      <Input
        allowClear
        size="large"
        placeholder={t("products.inventoryHistory.searchPlaceholder")}
        aria-label={t("products.inventoryHistory.searchAria")}
        prefix={<MagnifyingGlassIcon size={18} />}
        value={keywordDraft}
        data-qa="products-inventory-history-search"
        onFocus={() => {
          searchFocused.current = true;
        }}
        onBlur={() => {
          searchFocused.current = false;
        }}
        onChange={(event) => setKeywordDraft(event.target.value)}
        style={{ flex: "1 1 auto", minWidth: 0 }}
      />
      {filtersButton}
    </Flex>
  );
};
