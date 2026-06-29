import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Alert, Empty } from "antd";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getOrderStatusPath, pagesMap } from "@/app/router/pages-map";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";

import { useOrderStatusesReorder } from "../use-order-statuses-reorder";
import { MobileOrderStatusRow } from "./mobile-order-status-row";
import * as S from "./mobile-order-statuses-list-page.styled";

export const MobileOrderStatusesListPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const store = useOrdersStore();

  useEffect(() => {
    void store.loadStatuses({ force: true });
  }, [store]);

  const sortedStatuses = useMemo(
    () => [...store.statuses].sort((a, b) => a.sortOrder - b.sortOrder),
    [store.statuses],
  );

  const handleReorder = useOrderStatusesReorder(sortedStatuses);

  const statusIds = useMemo(
    () => sortedStatuses.map((status) => status.id),
    [sortedStatuses],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over == null || active.id === over.id) {
        return;
      }

      const oldIndex = sortedStatuses.findIndex(
        (status) => status.id === active.id,
      );
      const newIndex = sortedStatuses.findIndex(
        (status) => status.id === over.id,
      );
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
        return;
      }

      const next = [...sortedStatuses];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);

      void handleReorder(next.map((status) => status.id));
    },
    [handleReorder, sortedStatuses],
  );

  const handleOpen = useCallback(
    (statusId: number) => {
      navigate(getOrderStatusPath(statusId));
    },
    [navigate],
  );

  return (
    <S.Root>
      <S.Header>
        <S.TitleCluster>
          <S.BackButton
            type="text"
            icon={<ArrowLeftIcon size={20} />}
            aria-label={t("orderStatuses.mobile.backToOrdersAria")}
            data-qa="orders-mobile-statuses-back"
            onClick={() => navigate(pagesMap.orders)}
          />
          <S.PageTitle level={3}>{t("orderStatuses.title")}</S.PageTitle>
        </S.TitleCluster>
      </S.Header>

      <S.ScrollRegion>
        {store.statusesError ? (
          <Alert
            type="error"
            title={store.statusesError}
            showIcon
            style={{ marginTop: 16 }}
          />
        ) : null}

        {store.statusesLoading && sortedStatuses.length === 0 ? (
          <S.StateContainer>
            <CenteredSpinner minHeight={160} />
          </S.StateContainer>
        ) : sortedStatuses.length === 0 ? (
          <S.StateContainer>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("orderStatuses.noStatusesYet")}
            />
          </S.StateContainer>
        ) : (
          <S.ListCard>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={statusIds}
                strategy={verticalListSortingStrategy}
              >
                <S.SortableList role="list">
                  {sortedStatuses.map((status) => (
                    <MobileOrderStatusRow
                      key={status.id}
                      status={status}
                      reorderDisabled={store.statusSaveLoading}
                      onOpen={handleOpen}
                    />
                  ))}
                </S.SortableList>
              </SortableContext>
            </DndContext>
          </S.ListCard>
        )}
      </S.ScrollRegion>
    </S.Root>
  );
});
