import { Empty } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";

import { useWorkspaceMembersStore } from "@/features/workspace-members/model/use-workspace-members-store";
import { getWorkspaceMemberName } from "@/features/workspace-members/utils/workspace-member-display";

import {
  formatDate,
  getEventDescription,
} from "../../../utils/order-details.utils";

import type { OrderSectionProps } from "../order-details-content.types";
import { getActorLabel, getEventMeta } from "../utils/order-event.utils";
import * as S from "../order-details-content.styled";

export const HistoryCard = observer(({ order, t }: OrderSectionProps) => {
  const membersStore = useWorkspaceMembersStore();
  const actorNamesByUserId = useMemo(
    () =>
      new Map(
        membersStore.members.map((member) => [
          member.userId,
          getWorkspaceMemberName(member),
        ]),
      ),
    [membersStore.members],
  );

  const sortedEvents = useMemo(
    () =>
      [...order.events].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [order.events],
  );

  return (
    <S.DetailsCard className="no-print print-card section-history">
      <S.CardHeader>
        <S.CardTitle level={3}>{t("orders.details.statusHistory")}</S.CardTitle>
      </S.CardHeader>

      {sortedEvents.length ? (
        <S.HistoryList>
          {sortedEvents.map((event, index) => {
            const eventMeta = getEventMeta(event);
            const eventTitle = eventMeta.titleKey
              ? t(eventMeta.titleKey)
              : event.type;

            return (
              <S.HistoryItem
                key={event.id}
                $isLast={index === sortedEvents.length - 1}
              >
                <S.HistoryMarker $tone={eventMeta.tone} />

                <S.HistoryContent>
                  <S.StatusPill $tone={eventMeta.tone}>
                    <S.StatusDot />
                    {eventTitle}
                  </S.StatusPill>

                  <S.HistoryDescription>
                    {getEventDescription(event, order.items, order.currency, t)}
                  </S.HistoryDescription>

                  <S.HistoryActor type="secondary">
                    {getActorLabel(event, actorNamesByUserId, t)}
                  </S.HistoryActor>
                </S.HistoryContent>

                <S.HistoryDate type="secondary">
                  {formatDate(event.createdAt)}
                </S.HistoryDate>
              </S.HistoryItem>
            );
          })}
        </S.HistoryList>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("orders.noHistory")}
        />
      )}
    </S.DetailsCard>
  );
});
