import { FunnelSimpleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Badge, Button, Flex, Input } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useClientsStore } from "@/features/clients/model/use-clients-store";
import { BRAND_PRIMARY } from "@/styled/brand";
import { useIsMobileViewport } from "@/utils/use-media-query";

type ClientsListToolbarProps = {
  onToggleFilters: () => void;
};

export const ClientsListToolbar = observer(
  ({ onToggleFilters }: ClientsListToolbarProps) => {
    const { t } = useTranslation();
    const isMobileViewport = useIsMobileViewport();
    const clientsStore = useClientsStore();
    const [keywordDraft, setKeywordDraft] = useState(
      () => clientsStore.listKeyword,
    );
    const searchFocused = useRef(false);

    useLayoutEffect(() => {
      if (!searchFocused.current) {
        setKeywordDraft(clientsStore.listKeyword);
      }
    }, [clientsStore.listKeyword]);

    useEffect(() => {
      const id = window.setTimeout(() => {
        const nextApplied = keywordDraft.trim();
        if (nextApplied !== clientsStore.listKeyword) {
          clientsStore.setListKeyword(keywordDraft);
        }
      }, 350);

      return () => window.clearTimeout(id);
    }, [clientsStore, clientsStore.listKeyword, keywordDraft]);

    const filterCount = clientsStore.appliedNonKeywordFilterCount;
    const filtersButton = isMobileViewport ? (
      <Badge count={filterCount > 0 ? filterCount : 0} size="small">
        <Button
          type="default"
          icon={<FunnelSimpleIcon size={18} />}
          aria-label={t("clients.mobile.filtersAria")}
          data-qa="clients-list-filters-trigger"
          onClick={onToggleFilters}
        />
      </Badge>
    ) : (
      <Button
        type="default"
        data-qa="clients-list-filters-trigger"
        onClick={onToggleFilters}
      >
        <Flex align="center" gap={8}>
          <FunnelSimpleIcon size={18} />
          {t("clients.toolbar.filters")}
          {filterCount > 0 && (
            <Badge count={filterCount} color={BRAND_PRIMARY} />
          )}
        </Flex>
      </Button>
    );

    return (
      <Flex
        align="center"
        gap={isMobileViewport ? 8 : 16}
        wrap={isMobileViewport ? false : "wrap"}
        style={{
          marginBottom: isMobileViewport ? 12 : 16,
          width: "100%",
        }}
      >
        <Input
          allowClear
          placeholder={t("clients.searchPlaceholder")}
          aria-label={t("clients.mobile.searchAria")}
          prefix={<MagnifyingGlassIcon size={18} />}
          value={keywordDraft}
          onFocus={() => {
            searchFocused.current = true;
          }}
          onBlur={() => {
            searchFocused.current = false;
          }}
          onChange={(event) => setKeywordDraft(event.target.value)}
          style={{ flex: "1 1 200px", minWidth: 0 }}
        />
        {filtersButton}
      </Flex>
    );
  },
);
