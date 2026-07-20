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

import { MobileOrderStatusRow } from "./mobile-order-status-row";
import * as S from "./mobile-order-statuses-list-page.styled";

type MobileOrderStatusCategorySectionProps = {
  group: ReturnType<typeof groupOrderStatusesByCategory>[number];
  createDisabled: boolean;
  creating: boolean;
  onOpen: (statusId: number) => void;
  onCreateStatus: (category: OrderStatusCategory) => void;
};

const MobileOrderStatusCategorySection = ({
  group,
  createDisabled,
  creating,
  onOpen,
  onCreateStatus,
}: MobileOrderStatusCategorySectionProps) => {
  const { t } = useTranslation();
  const categoryLabel = t(getOrderStatusCategoryLabelKey(group.category));

  return (
    <S.CategorySection
      data-qa={`orders-mobile-status-category-${group.category}`}
    >
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
          data-qa={`orders-mobile-status-category-add-${group.category}`}
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

      {group.statuses.length > 0 && (
        <S.ListCard>
          <S.StatusTree role="list">
            {group.statuses.map((status) => (
              <MobileOrderStatusRow
                key={status.id}
                status={status}
                onOpen={onOpen}
              />
            ))}
          </S.StatusTree>
        </S.ListCard>
      )}
    </S.CategorySection>
  );
};

export type MobileOrderStatusesNavListProps = {
  statuses: OrderStatus[];
  creatingCategory?: OrderStatusCategory | null;
  createDisabled?: boolean;
  onOpen: (statusId: number) => void;
  onCreateStatus: (category: OrderStatusCategory) => void;
};

export const MobileOrderStatusesNavList = ({
  statuses,
  creatingCategory = null,
  createDisabled = false,
  onOpen,
  onCreateStatus,
}: MobileOrderStatusesNavListProps) => {
  const groups = useMemo(
    () => groupOrderStatusesByCategory(statuses),
    [statuses],
  );

  return (
    <S.NavRoot data-qa="orders-mobile-statuses-nav-list">
      {groups.map((group) => (
        <MobileOrderStatusCategorySection
          key={group.category}
          group={group}
          createDisabled={createDisabled}
          creating={creatingCategory === group.category}
          onOpen={onOpen}
          onCreateStatus={onCreateStatus}
        />
      ))}
    </S.NavRoot>
  );
};
