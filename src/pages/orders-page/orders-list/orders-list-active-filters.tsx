import { Button, Flex, Typography } from "antd";
import { Tag } from "@/components/tag/tag";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

import { GroupColoredNameTag } from "@/features/conversation-groups/components/group-select-visuals";
import type { OrderSourceFilter } from "@/features/orders/model/order-list.constants";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import { formatDate } from "@/utils/date-time";

const { Text } = Typography;

function formatDateLabel(value: string): string {
  return formatDate(value);
}

export const OrdersListActiveFilters = observer(() => {
  const { t } = useTranslation();
  const ordersStore = useOrdersStore();

  const hasKeyword = Boolean(ordersStore.listKeyword);
  const hasStatuses = ordersStore.listStatusIds.length > 0;
  const hasSources = ordersStore.listSources.length > 0;
  const hasTotalFrom = ordersStore.listTotalPriceFrom != null;
  const hasTotalTo = ordersStore.listTotalPriceTo != null;
  const hasTotal = hasTotalFrom || hasTotalTo;
  const hasCreatedFrom = ordersStore.listCreatedFrom != null;
  const hasCreatedTo = ordersStore.listCreatedTo != null;
  const hasCreated = hasCreatedFrom || hasCreatedTo;

  if (!hasKeyword && !hasStatuses && !hasSources && !hasTotal && !hasCreated) {
    return null;
  }

  const totalLabel =
    hasTotalFrom && hasTotalTo
      ? t("orders.listFilters.tagTotalRange", {
          min: ordersStore.listTotalPriceFrom,
          max: ordersStore.listTotalPriceTo,
        })
      : hasTotalFrom
        ? t("orders.listFilters.tagTotalMin", {
            min: ordersStore.listTotalPriceFrom,
          })
        : t("orders.listFilters.tagTotalMax", {
            max: ordersStore.listTotalPriceTo,
          });

  const createdLabel =
    hasCreatedFrom && hasCreatedTo
      ? t("orders.listFilters.tagCreatedRange", {
          from: formatDateLabel(ordersStore.listCreatedFrom!),
          to: formatDateLabel(ordersStore.listCreatedTo!),
        })
      : hasCreatedFrom
        ? t("orders.listFilters.tagCreatedFrom", {
            from: formatDateLabel(ordersStore.listCreatedFrom!),
          })
        : t("orders.listFilters.tagCreatedTo", {
            to: formatDateLabel(ordersStore.listCreatedTo!),
          });

  return (
    <Flex align="center" gap={24} wrap="wrap" style={{ marginBottom: 12 }}>
      <Text strong style={{ display: "block" }}>
        {t("orders.listFilters.activeTitle")}
      </Text>
      <Flex gap={8} wrap="wrap" align="center">
        {hasKeyword && (
          <Tag
            closable
            onClose={() => {
              ordersStore.clearListKeyword();
            }}
            color="purple"
          >
            {t("orders.listFilters.tagSearch", {
              keyword: ordersStore.listKeyword,
            })}
          </Tag>
        )}
        {ordersStore.listStatusIds.map((statusId) => {
          const status = ordersStore.statusById.get(statusId);
          if (status) {
            return (
              <GroupColoredNameTag
                key={statusId}
                name={status.name}
                color={status.color}
                closable
                onClose={() => {
                  ordersStore.removeListStatusId(statusId);
                }}
              />
            );
          }

          return (
            <Tag
              key={statusId}
              closable
              onClose={() => {
                ordersStore.removeListStatusId(statusId);
              }}
              color="purple"
            >
              {t("orders.listFilters.tagStatusFallback", { id: statusId })}
            </Tag>
          );
        })}
        {ordersStore.listSources.map((source) => (
          <Tag
            key={source}
            closable
            onClose={() => {
              ordersStore.removeListSource(source as OrderSourceFilter);
            }}
            color="purple"
          >
            {t("orders.listFilters.tagSource", {
              label: t(`orders.sources.${source}`, { defaultValue: source }),
            })}
          </Tag>
        ))}
        {hasTotal && (
          <Tag
            closable
            onClose={() => {
              ordersStore.clearListTotalPriceRange();
            }}
            color="purple"
          >
            {totalLabel}
          </Tag>
        )}
        {hasCreated && (
          <Tag
            closable
            onClose={() => {
              ordersStore.clearListCreatedRange();
            }}
            color="purple"
          >
            {createdLabel}
          </Tag>
        )}
        <Button
          type="link"
          size="small"
          onClick={() => ordersStore.clearAllListFilters()}
        >
          {t("orders.listFilters.clearAll")}
        </Button>
      </Flex>
    </Flex>
  );
});
