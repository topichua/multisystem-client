import { Alert, Flex, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";

import type { ConversationPanelProps } from "./conversation-panel.types";
import { ConversationListGroupFilter } from "./conversation-list-group-filter";
import { ConversationRow } from "./conversation-row";
import { ConversationRowSkeleton } from "./conversation-row-skeleton";
import * as S from "./conversation.styled";

const SKELETON_ROW_KEYS = [0, 1, 2, 3, 4] as const;

export const Conversation = observer(({ onSelect }: ConversationPanelProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const {
    loadConversations,
    sortedConversations,
    listLoading,
    listError,
    clearConversationListError,
  } = useConversationsStore();

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const showSkeleton = listLoading && sortedConversations.length === 0;

  return (
    <S.Column>
      <S.ListHeader>
        <Flex vertical>
          <S.Title level={4}>{t("conversations.title")}</S.Title>
          <S.MobileOnlyFilterRow>
            <ConversationListGroupFilter />
          </S.MobileOnlyFilterRow>
          {listError ? (
            <Alert
              type="error"
              title={listError}
              showIcon
              closable={{ onClose: clearConversationListError }}
              style={{ margin: "0 12px 8px" }}
            />
          ) : null}
        </Flex>
      </S.ListHeader>
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
              : sortedConversations.map((conversation) => (
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
    </S.Column>
  );
});
