import { FunnelSimpleIcon } from "@phosphor-icons/react";
import { Button, DatePicker, Drawer, Flex, Segmented, Typography } from "antd";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { ClientsBlockedFilter } from "@/features/clients/model/client.types";
import { useClientsStore } from "@/features/clients/model/use-clients-store";
import { formatApiDate } from "@/utils/date-time";
import { useIsMobileViewport } from "@/utils/use-media-query";

const { Text } = Typography;

type ClientsListFiltersPanelProps = {
  open: boolean;
  onClose: () => void;
};

export const ClientsListFiltersPanel = observer(
  ({ open, onClose }: ClientsListFiltersPanelProps) => {
    const { t } = useTranslation();
    const clientsStore = useClientsStore();
    const isMobileViewport = useIsMobileViewport();

    const blockedOptions = useMemo<
      { label: string; value: ClientsBlockedFilter }[]
    >(
      () => [
        {
          label: t("clients.listFilters.blocked.all"),
          value: "all",
        },
        {
          label: t("clients.listFilters.blocked.not_blocked"),
          value: "not_blocked",
        },
        {
          label: t("clients.listFilters.blocked.blocked"),
          value: "blocked",
        },
      ],
      [t],
    );

    useEffect(() => {
      if (open) {
        clientsStore.syncFilterDraftFromApplied();
      }
    }, [
      clientsStore,
      clientsStore.listBlocked,
      clientsStore.listCreatedFrom,
      clientsStore.listCreatedTo,
      clientsStore.listLastOrderFrom,
      clientsStore.listLastOrderTo,
      open,
    ]);

    const filterContent = (
      <Flex
        vertical
        gap={20}
        style={{
          width: isMobileViewport ? "100%" : 360,
          maxWidth: isMobileViewport ? "100%" : "80vw",
        }}
      >
        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            {t("clients.listFilters.panelBlockedSection")}
          </Text>
          <Segmented<ClientsBlockedFilter>
            block
            value={clientsStore.draftBlocked}
            options={blockedOptions}
            onChange={(value) => clientsStore.setDraftBlocked(value)}
          />
        </div>

        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            {t("clients.listFilters.panelCreatedSection")}
          </Text>
          <Flex gap={8} align="center">
            <DatePicker
              format="DD.MM.YYYY"
              placeholder={t("clients.listFilters.datePlaceholder")}
              style={{ flex: 1, minWidth: 0 }}
              value={
                clientsStore.draftCreatedFrom
                  ? dayjs(clientsStore.draftCreatedFrom)
                  : null
              }
              onChange={(value) => {
                clientsStore.setDraftCreatedFrom(
                  value ? formatApiDate(value) : null,
                );
              }}
            />
            <span>-</span>
            <DatePicker
              format="DD.MM.YYYY"
              placeholder={t("clients.listFilters.datePlaceholder")}
              style={{ flex: 1, minWidth: 0 }}
              value={
                clientsStore.draftCreatedTo
                  ? dayjs(clientsStore.draftCreatedTo)
                  : null
              }
              onChange={(value) => {
                clientsStore.setDraftCreatedTo(
                  value ? formatApiDate(value) : null,
                );
              }}
            />
          </Flex>
        </div>

        <div>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            {t("clients.listFilters.panelLastOrderSection")}
          </Text>
          <Flex gap={8} align="center">
            <DatePicker
              format="DD.MM.YYYY"
              placeholder={t("clients.listFilters.datePlaceholder")}
              style={{ flex: 1, minWidth: 0 }}
              value={
                clientsStore.draftLastOrderFrom
                  ? dayjs(clientsStore.draftLastOrderFrom)
                  : null
              }
              onChange={(value) => {
                clientsStore.setDraftLastOrderFrom(
                  value ? formatApiDate(value) : null,
                );
              }}
            />
            <span>-</span>
            <DatePicker
              format="DD.MM.YYYY"
              placeholder={t("clients.listFilters.datePlaceholder")}
              style={{ flex: 1, minWidth: 0 }}
              value={
                clientsStore.draftLastOrderTo
                  ? dayjs(clientsStore.draftLastOrderTo)
                  : null
              }
              onChange={(value) => {
                clientsStore.setDraftLastOrderTo(
                  value ? formatApiDate(value) : null,
                );
              }}
            />
          </Flex>
        </div>
      </Flex>
    );

    return (
      <Drawer
        title={t("clients.toolbar.filters")}
        closable={{ placement: "end" }}
        open={open}
        placement={isMobileViewport ? "bottom" : "right"}
        size={isMobileViewport ? undefined : "auto"}
        height={isMobileViewport ? "auto" : undefined}
        onClose={onClose}
        destroyOnHidden
        data-qa={isMobileViewport ? "clients-mobile-filters-drawer" : undefined}
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
            <Button
              style={{ flex: 1 }}
              onClick={() => clientsStore.resetFilterDraft()}
            >
              {t("clients.listFilters.panelClear")}
            </Button>
            <Button
              type="primary"
              style={{ flex: 1 }}
              icon={<FunnelSimpleIcon size={16} />}
              onClick={() => {
                clientsStore.applyFiltersFromPanel();
                onClose();
              }}
            >
              {t("clients.listFilters.panelApply")}
            </Button>
          </Flex>
        }
      >
        {filterContent}
      </Drawer>
    );
  },
);
