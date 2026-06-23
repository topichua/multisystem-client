import {
  BookmarkSimpleIcon,
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  FunnelIcon,
} from "@phosphor-icons/react";
import { Button, Flex, Input, Segmented, Spin, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import type { Conversation as ConversationModel } from "@/features/conversations/model/types";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";

import { ConversationRowSkeleton } from "./components/conversation-row-skeleton";
import type { ConversationPanelProps } from "./conversation-panel.types";
import { ConversationRow } from "./conversation-row";
import * as S from "./conversation.styled";
import { FilterLabel } from "./segment-filter-label";

const { Title } = Typography;

const SKELETON_ROW_KEYS = [0, 1, 2, 3, 4] as const;

type ConversationListSegment = "all" | "unread";

const normalizeSearchValue = (value: string): string =>
  value.trim().toLocaleLowerCase();

const conversationMatchesSearch = (
  conversation: ConversationModel,
  normalizedQuery: string,
): boolean => {
  if (!normalizedQuery) {
    return true;
  }

  const username = conversation.participant.username ?? "";
  const searchableValues = [
    conversation.participant.name,
    username,
    username ? `@${username}` : "",
  ];

  return searchableValues.some((value) =>
    value.toLocaleLowerCase().includes(normalizedQuery),
  );
};

export const Conversation = observer(
  ({ collapsed, onCollapse, onExpand, onSelect }: ConversationPanelProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { conversationId } = useParams();
    const { loadConversations, sortedConversations, listLoading } =
      useConversationsStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSegment, setSelectedSegment] =
      useState<ConversationListSegment>("all");

    useEffect(() => {
      void loadConversations();
    }, [loadConversations]);

    const searchMatchedConversations = useMemo(() => {
      const normalizedQuery = normalizeSearchValue(searchQuery);

      return sortedConversations.filter((conversation) =>
        conversationMatchesSearch(conversation, normalizedQuery),
      );
    }, [searchQuery, sortedConversations]);

    const unreadConversations = useMemo(
      () =>
        searchMatchedConversations.filter(
          (conversation) => conversation.unreadCount > 0,
        ),
      [searchMatchedConversations],
    );

    const visibleConversations =
      selectedSegment === "unread"
        ? unreadConversations
        : searchMatchedConversations;

    const showSkeleton = listLoading && sortedConversations.length === 0;

    const segmentedOptions = [
      {
        label: (
          <FilterLabel
            label={t("conversations.all")}
            count={searchMatchedConversations.length}
          />
        ),
        value: "all",
      },
      {
        label: (
          <FilterLabel
            label={t("conversations.unread")}
            count={unreadConversations.length}
          />
        ),
        value: "unread",
      },
    ];

    if (collapsed) {
      return (
        <S.CollapsedColumn>
          <S.ExpandButton
            type="button"
            aria-label={t("groups.expandGroupsPaneAria")}
            onClick={onExpand}
          >
            <CaretDoubleRightIcon size={16} weight="bold" />
          </S.ExpandButton>
        </S.CollapsedColumn>
      );
    }

    return (
      <S.Conversation>
        <Flex justify="space-between" gap={12}>
          <Title level={4}>{t("conversations.title")}</Title>
          <S.HeaderActions>
            <S.ExpandButton
              type="button"
              aria-label={t("groups.expandGroupsPaneAria")}
              onClick={onCollapse}
            >
              <CaretDoubleLeftIcon size={16} weight="bold" />
            </S.ExpandButton>
          </S.HeaderActions>
        </Flex>

        <Flex align="center" gap={8}>
          <Input.Search
            allowClear
            value={searchQuery}
            placeholder={t("conversations.searchPlaceholder")}
            onChange={(event) => setSearchQuery(event.target.value)}
            onSearch={setSearchQuery}
          />
          <Button variant="filled" color="default" style={{ padding: "0 8px" }}>
            <FunnelIcon size={18} weight="regular" />
          </Button>
        </Flex>

        <Flex align="center" gap={8}>
          <Segmented
            block
            value={selectedSegment}
            style={{ flex: 1 }}
            options={segmentedOptions}
            onChange={(value) =>
              setSelectedSegment(value as ConversationListSegment)
            }
          />
          <Button variant="filled" color="default" style={{ padding: "0 8px" }}>
            <BookmarkSimpleIcon size={18} weight="regular" />
          </Button>
        </Flex>

        <S.ListScroll>
          <Spin spinning={listLoading}>
            <Flex
              vertical
              gap={2}
              style={{ minHeight: listLoading ? 120 : undefined }}
            >
              {showSkeleton
                ? SKELETON_ROW_KEYS.map((i) => (
                    <ConversationRowSkeleton key={i} />
                  ))
                : visibleConversations.map((conversation) => (
                    <ConversationRow
                      key={conversation.id}
                      conversation={conversation}
                      conversationId={conversationId}
                      onNavigate={(id) =>
                        navigate(`${pagesMap.conversations}/${id}`)
                      }
                      onSelect={onSelect}
                    />
                  ))}
            </Flex>
          </Spin>
        </S.ListScroll>
      </S.Conversation>
    );
  },
);
