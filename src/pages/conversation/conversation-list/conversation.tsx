import {
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  EnvelopeSimpleIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";
import { Alert, Flex, Input, Segmented, Spin, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { pagesMap } from "@/app/router/pages-map";
import { useEnsureConversationGroupsLoaded } from "@/features/conversation-groups/model/use-ensure-conversation-groups-loaded";
import { useEnsureIntegrationsLoaded } from "@/features/integrations/model/use-ensure-integrations-loaded";
import type { ConversationListSegment } from "@/features/conversations/model/conversation-store";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";
import { instagramApi } from "@/features/instagram/api/instagram-api";
import { useEnsureWorkspaceMembersLoaded } from "@/features/workspace-members/model/use-ensure-workspace-members-loaded";

import { ConversationRowSkeleton } from "./components/conversation-row-skeleton";
import { ConversationFiltersPopover } from "./conversation-filters-popover";
import { ConversationGroupedList } from "./conversation-grouped-list";
import { ConversationGroupingDropdown } from "./conversation-grouping-dropdown";
import type { ConversationPanelProps } from "./conversation-panel.types";
import { ConversationRow } from "./conversation-row";
import * as S from "./conversation.styled";
import { FilterLabel } from "./segment-filter-label";

const { Title } = Typography;

const SKELETON_ROW_KEYS = [0, 1, 2, 3, 4] as const;

const SEARCH_DEBOUNCE_MS = 400;

let activeInstagramSynchronizationCheck: Promise<boolean> | null = null;

function loadActiveInstagramSynchronizationOnce(): Promise<boolean> {
  if (activeInstagramSynchronizationCheck == null) {
    activeInstagramSynchronizationCheck = instagramApi
      .getActiveSynchronizations()
      .catch(() => false);
  }

  return activeInstagramSynchronizationCheck;
}

export const Conversation = observer(
  ({
    collapsed,
    variant = "desktop",
    listHeaderSlot,
    onCollapse,
    onExpand,
    onSelect,
  }: ConversationPanelProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { conversationId } = useParams();
    useEnsureConversationGroupsLoaded();
    useEnsureWorkspaceMembersLoaded();
    useEnsureIntegrationsLoaded();

    const {
      loadConversations,
      sortedConversations,
      listLoading,
      listCounters,
      conversationGroupingBy,
      conversationListSegment,
      setConversationListSegment,
      setConversationListKeyword,
    } = useConversationsStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [instagramSyncInProgress, setInstagramSyncInProgress] =
      useState(false);

    useEffect(() => {
      void loadConversations();
    }, [loadConversations]);

    useEffect(() => {
      let cancelled = false;

      void loadActiveInstagramSynchronizationOnce().then((isActive) => {
        if (!cancelled) {
          setInstagramSyncInProgress(isActive);
        }
      });

      return () => {
        cancelled = true;
      };
    }, []);

    useEffect(() => {
      const timeoutId = window.setTimeout(() => {
        setConversationListKeyword(searchQuery);
      }, SEARCH_DEBOUNCE_MS);

      return () => window.clearTimeout(timeoutId);
    }, [searchQuery, setConversationListKeyword]);

    const visibleConversations = sortedConversations;

    const showSkeleton = listLoading && sortedConversations.length === 0;

    const segmentedOptions = [
      {
        label: (
          <FilterLabel
            label={t("conversations.all")}
            count={listCounters.total}
          />
        ),
        value: "all",
      },
      {
        label: (
          <FilterLabel
            ariaLabel={t("conversations.unread")}
            icon={<EnvelopeSimpleIcon size={16} weight="regular" />}
            count={listCounters.unread}
          />
        ),
        value: "unread",
      },
      {
        label: (
          <FilterLabel
            ariaLabel={t("conversations.withoutResponsible")}
            icon={<UserPlusIcon size={16} weight="regular" />}
            count={listCounters.withoutResponsible}
          />
        ),
        value: "withoutResponsible",
      },
    ];

    const isMobile = variant === "mobile";

    if (collapsed && !isMobile) {
      return (
        <S.CollapsedColumn>
          <S.ExpandButton
            type="button"
            aria-label={t("groups.expandGroupsPaneAria")}
            onClick={onExpand}
          >
            <CaretDoubleRightIcon size={16} weight="bold" />
          </S.ExpandButton>
          <S.CollapsedLabel>{t("conversations.title")}</S.CollapsedLabel>
        </S.CollapsedColumn>
      );
    }

    return (
      <S.Conversation $variant={variant}>
        <Flex align="center" justify="space-between" gap={12}>
          <Flex align="center" justify="space-between" style={{ flex: 1 }}>
            <Title level={4}>{t("conversations.title")}</Title>
            <ConversationGroupingDropdown
              size={isMobile ? "large" : "middle"}
            />
          </Flex>
          {!isMobile && (
            <S.HeaderActions>
              <S.ExpandButton
                type="button"
                aria-label={t("conversations.collapseListPaneAria")}
                onClick={onCollapse}
              >
                <CaretDoubleLeftIcon size={16} weight="bold" />
              </S.ExpandButton>
            </S.HeaderActions>
          )}
        </Flex>

        {listHeaderSlot}

        {instagramSyncInProgress ? (
          <Alert
            type="info"
            showIcon
            closable
            onClose={() => setInstagramSyncInProgress(false)}
            title={t("conversations.instagramSyncInProgress")}
          />
        ) : null}

        <Flex align="center" gap={8}>
          <Input.Search
            allowClear
            size={isMobile ? "large" : "middle"}
            value={searchQuery}
            placeholder={t("conversations.searchPlaceholder")}
            onChange={(event) => setSearchQuery(event.target.value)}
            onSearch={setSearchQuery}
          />
          <ConversationFiltersPopover size={isMobile ? "large" : "middle"} />
        </Flex>

        <Flex align="center" gap={8}>
          <Segmented
            block
            value={conversationListSegment}
            style={{ flex: 1 }}
            options={segmentedOptions}
            onChange={(value) =>
              setConversationListSegment(value as ConversationListSegment)
            }
          />
          {/* <Button variant="filled" color="default" style={{ padding: "0 8px" }}>
            <BookmarkSimpleIcon size={18} weight="regular" />
          </Button> */}
        </Flex>

        <S.ListScroll $variant={variant}>
          {conversationGroupingBy == null ? (
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
          ) : (
            <ConversationGroupedList
              conversationId={conversationId}
              onNavigate={(id) => navigate(`${pagesMap.conversations}/${id}`)}
              onSelect={onSelect}
            />
          )}
        </S.ListScroll>
      </S.Conversation>
    );
  },
);
