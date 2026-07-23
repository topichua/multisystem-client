import { Alert, Badge, Empty, Flex, Spin, Typography, theme } from "antd";
import type { CollapseProps } from "antd";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { UserAvatar } from "@/components/user-avatar";
import { InstagramLogoIcon } from "@/components/icons/instagram/instagram-logo-icon";
import { TelegramLogoIcon } from "@/components/icons/telegram/telegram-logo-icon";
import type {
  ConversationGroupBucket,
  ConversationGroupingBy,
} from "@/features/conversations/api/conversations-api";
import type { ConversationChannel } from "@/features/conversations/model/types";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";

import { ConversationRowSkeleton } from "./components/conversation-row-skeleton";
import { ConversationRow } from "./conversation-row";
import * as S from "./conversation.styled";

const SKELETON_ROW_KEYS = [0, 1, 2] as const;

type ConversationGroupedListProps = {
  conversationId: string | undefined;
  onNavigate: (id: number) => void;
  onSelect?: () => void;
};

const getBucketColor = (
  bucket: ConversationGroupBucket,
  fallbackColor: string,
): string => bucket.meta.color.trim() || fallbackColor;

const isUnassignedResponsibleBucket = (
  bucket: ConversationGroupBucket,
): boolean => {
  const key = bucket.key.toLowerCase();
  const label = bucket.label.trim().toLowerCase();

  return (
    key.includes("without") ||
    key.includes("unassigned") ||
    key === "null" ||
    key === "none" ||
    label.startsWith("без") ||
    label.startsWith("without")
  );
};

const getChannelType = (
  bucket: ConversationGroupBucket,
): ConversationChannel => {
  if (bucket.meta.channel?.type === "telegram") {
    return "telegram";
  }

  if (bucket.key.toLowerCase().includes("telegram")) {
    return "telegram";
  }

  return "instagram";
};

const renderChannelIcon = (channelType: ConversationChannel): ReactNode =>
  channelType === "telegram" ? (
    <TelegramLogoIcon size={14} />
  ) : (
    <InstagramLogoIcon size={14} />
  );

const renderBucketPrefix = (
  groupingBy: ConversationGroupingBy,
  bucket: ConversationGroupBucket,
  fallbackColor: string,
): ReactNode => {
  if (groupingBy === "responsible") {
    if (isUnassignedResponsibleBucket(bucket)) {
      return null;
    }

    return (
      <UserAvatar
        size={18}
        name={bucket.label}
        style={{ backgroundColor: getBucketColor(bucket, fallbackColor) }}
      />
    );
  }

  if (groupingBy === "status") {
    return (
      <S.GroupingStatusDot
        $color={getBucketColor(bucket, fallbackColor)}
        aria-hidden="true"
      />
    );
  }

  if (groupingBy === "channel") {
    return (
      <S.GroupingChannelIcon aria-hidden="true">
        {renderChannelIcon(getChannelType(bucket))}
      </S.GroupingChannelIcon>
    );
  }

  return null;
};

const renderBucketLabel = (
  groupingBy: ConversationGroupingBy,
  bucket: ConversationGroupBucket,
  fallbackColor: string,
) => (
  <S.GroupingHeaderLabel>
    {renderBucketPrefix(groupingBy, bucket, fallbackColor)}
    <S.GroupingHeaderName>{bucket.label}</S.GroupingHeaderName>
  </S.GroupingHeaderLabel>
);

export const ConversationGroupedList = observer(
  ({ conversationId, onNavigate, onSelect }: ConversationGroupedListProps) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const conversationsStore = useConversationsStore();
    const groupingBy = conversationsStore.conversationGroupingBy;
    const visibleBuckets =
      conversationsStore.visibleConversationGroupingBuckets;

    const items = useMemo<CollapseProps["items"]>(() => {
      if (groupingBy == null) {
        return [];
      }

      return visibleBuckets.map((bucket) => {
        const loadedConversations =
          conversationsStore.groupedConversationsByKey[bucket.key];
        const conversations = loadedConversations ?? [];
        const displayCount = loadedConversations?.length ?? bucket.count;
        const loading = Boolean(
          conversationsStore.groupedConversationsLoadingByKey[bucket.key],
        );
        const error =
          conversationsStore.groupedConversationsErrorByKey[bucket.key];

        const children = (
          <Spin spinning={loading && conversations.length > 0}>
            <S.GroupingBucketRows>
              {error ? (
                <Alert
                  type="error"
                  showIcon
                  message={t("conversations.grouping.bucketLoadError")}
                  description={error}
                />
              ) : loading && conversations.length === 0 ? (
                SKELETON_ROW_KEYS.map((key) => (
                  <ConversationRowSkeleton key={key} />
                ))
              ) : conversations.length > 0 ? (
                conversations.map((conversation) => (
                  <ConversationRow
                    key={conversation.id}
                    conversation={conversation}
                    conversationId={conversationId}
                    onNavigate={onNavigate}
                    onSelect={onSelect}
                  />
                ))
              ) : (
                <Typography.Text type="secondary">
                  {t("conversations.grouping.empty")}
                </Typography.Text>
              )}
            </S.GroupingBucketRows>
          </Spin>
        );

        return {
          key: bucket.key,
          label: renderBucketLabel(groupingBy, bucket, token.colorPrimary),
          extra: (
            <Badge
              count={displayCount}
              showZero
              style={{
                backgroundColor: token.colorFillSecondary,
                boxShadow: "none",
                color: token.colorTextTertiary,
              }}
            />
          ),
          children,
        };
      });
    }, [
      conversationId,
      conversationsStore.groupedConversationsByKey,
      conversationsStore.groupedConversationsErrorByKey,
      conversationsStore.groupedConversationsLoadingByKey,
      groupingBy,
      onNavigate,
      onSelect,
      t,
      token.colorFillSecondary,
      token.colorPrimary,
      token.colorTextTertiary,
      visibleBuckets,
    ]);

    if (groupingBy == null) {
      return null;
    }

    if (
      conversationsStore.conversationGroupingBucketsLoading &&
      visibleBuckets.length === 0
    ) {
      return (
        <Flex align="center" justify="center" style={{ minHeight: 120 }}>
          <Spin />
        </Flex>
      );
    }

    if (conversationsStore.conversationGroupingBucketsError) {
      return (
        <Alert
          type="error"
          showIcon
          title={t("conversations.grouping.loadError")}
          description={conversationsStore.conversationGroupingBucketsError}
        />
      );
    }

    if (visibleBuckets.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("conversations.grouping.empty")}
        />
      );
    }

    return (
      <S.GroupingCollapse
        ghost
        activeKey={conversationsStore.expandedConversationGroupingKeys}
        expandIconPlacement="start"
        items={items}
        onChange={(keys) => {
          conversationsStore.setExpandedConversationGroupingKeys(
            Array.isArray(keys) ? keys.map(String) : [String(keys)],
          );
        }}
      />
    );
  },
);
