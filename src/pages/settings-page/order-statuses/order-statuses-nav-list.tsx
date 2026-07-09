import { PlusIcon } from "@phosphor-icons/react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type {
  OrderStatus,
  OrderStatusCategory,
} from "@/features/orders/model/order.types";
import {
  getOrderStatusCategoryLabelKey,
  groupOrderStatusesByCategory,
} from "@/features/orders/utils/group-order-statuses-by-category";

import * as S from "./order-statuses-nav-list.styled";
import { OrderStatusSystemBadge } from "./order-status-system-badge";

type OrderStatusNavItemProps = {
  status: OrderStatus;
  selected: boolean;
  onSelect: (statusId: number) => void;
};

const OrderStatusNavItem = ({
  status,
  selected,
  onSelect,
}: OrderStatusNavItemProps) => {
  return (
    <S.StatusItem
      role="listitem"
      data-status-id={status.id}
      data-qa={`order-status-nav-item-${status.id}`}
      $selected={selected}
    >
      <S.StatusButton
        type="button"
        aria-current={selected ? "page" : undefined}
        onClick={() => onSelect(status.id)}
      >
        <S.StatusDot $color={status.color} aria-hidden="true" />
        <S.StatusName>{status.name}</S.StatusName>
        {status.isSystem ? <OrderStatusSystemBadge /> : null}
      </S.StatusButton>
    </S.StatusItem>
  );
};

type OrderStatusCategorySectionProps = {
  group: ReturnType<typeof groupOrderStatusesByCategory>[number];
  selectedStatusId: number | null;
  createDisabled: boolean;
  creating: boolean;
  onSelect: (statusId: number) => void;
  onCreateStatus: (category: OrderStatusCategory) => void;
};

const OrderStatusCategorySection = ({
  group,
  selectedStatusId,
  createDisabled,
  creating,
  onSelect,
  onCreateStatus,
}: OrderStatusCategorySectionProps) => {
  const { t } = useTranslation();
  const categoryLabel = t(getOrderStatusCategoryLabelKey(group.category));

  return (
    <S.CategorySection data-qa={`order-status-category-${group.category}`}>
      <S.CategoryHeader>
        <S.CategoryDot $color={group.color} aria-hidden="true" />
        <S.CategoryTitleCluster>
          <S.CategoryTitle>{categoryLabel}</S.CategoryTitle>
          <S.CategoryCount>{group.statuses.length}</S.CategoryCount>
        </S.CategoryTitleCluster>
        <S.CategoryAddButton
          type="button"
          aria-label={t("orderStatuses.addStatusAria", {
            category: categoryLabel,
          })}
          data-qa={`order-status-category-add-${group.category}`}
          disabled={createDisabled}
          onClick={() => onCreateStatus(group.category)}
        >
          {creating ? (
            <span aria-hidden="true">…</span>
          ) : (
            <PlusIcon size={14} aria-hidden="true" />
          )}
        </S.CategoryAddButton>
      </S.CategoryHeader>

      {group.statuses.length > 0 ? (
        <S.StatusTree role="list">
          {group.statuses.map((status) => (
            <OrderStatusNavItem
              key={status.id}
              status={status}
              selected={selectedStatusId === status.id}
              onSelect={onSelect}
            />
          ))}
        </S.StatusTree>
      ) : null}
    </S.CategorySection>
  );
};

export type OrderStatusesNavListProps = {
  statuses: OrderStatus[];
  selectedStatusId: number | null;
  creatingCategory?: OrderStatusCategory | null;
  createDisabled?: boolean;
  onSelect: (statusId: number) => void;
  onCreateStatus: (category: OrderStatusCategory) => void;
};

export const OrderStatusesNavList = ({
  statuses,
  selectedStatusId,
  creatingCategory = null,
  createDisabled = false,
  onSelect,
  onCreateStatus,
}: OrderStatusesNavListProps) => {
  const groups = useMemo(
    () => groupOrderStatusesByCategory(statuses),
    [statuses],
  );

  return (
    <S.NavRoot data-qa="order-statuses-nav-list">
      {groups.map((group) => (
        <OrderStatusCategorySection
          key={group.category}
          group={group}
          selectedStatusId={selectedStatusId}
          createDisabled={createDisabled}
          creating={creatingCategory === group.category}
          onSelect={onSelect}
          onCreateStatus={onCreateStatus}
        />
      ))}
    </S.NavRoot>
  );
};
