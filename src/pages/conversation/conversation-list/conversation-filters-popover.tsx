import {
  FunnelIcon,
  InstagramLogoIcon,
  TelegramLogoIcon,
} from "@phosphor-icons/react";
import {
  Avatar,
  Button,
  Checkbox,
  Divider,
  Flex,
  Popover,
  Spin,
  Typography,
  theme,
} from "antd";
import type { GlobalToken } from "antd/es/theme/interface";
import { observer } from "mobx-react-lite";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { UserAvatar } from "@/components/user-avatar";
import {
  conversationsApi,
  type ConversationCriteria,
} from "@/features/conversations/api/conversations-api";
import type { ConversationChannel } from "@/features/conversations/model/types";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";

const EMPTY_CRITERIA: ConversationCriteria = {
  channels: [],
  responsibleUsers: [],
};

const CHANNEL_TYPES: ConversationChannel[] = ["instagram", "telegram"];

const normalizeDraftIds = (ids: number[]): number[] =>
  [...new Set(ids)]
    .filter((id) => Number.isInteger(id) && id > 0)
    .sort((a, b) => a - b);

const getPanelStyle = (token: GlobalToken): CSSProperties => ({
  width: 'min(300px, calc(100vw - 32px))',
  overflow: 'hidden',
  borderRadius: token.borderRadiusLG,
  background: token.colorBgElevated,
});

const panelHeaderStyle: CSSProperties = {
  padding: "8px 12px",
};

const panelBodyStyle = (token: GlobalToken): CSSProperties => ({
  height: 200,
  overflowY: "auto",
  overflowX: "hidden",
  padding: "8px 12px",
  borderTop: `1px solid ${token.colorBorderSecondary}`,
  borderBottom: `1px solid ${token.colorBorderSecondary}`,
});

const sectionTitleStyle: CSSProperties = {
  display: "block",
  textTransform: "uppercase",
};

const checkboxRowStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
};

const indentedCheckboxRowStyle: CSSProperties = {
  ...checkboxRowStyle,
  paddingLeft: 16,
};

const sourceIconStyle = (type: ConversationChannel): CSSProperties => ({
  flex: "0 0 auto",
  color: "#fff",
  background:
    type === "telegram"
      ? "#2aabee"
      : "linear-gradient(135deg, #f9ce34 0%, #ee2a7b 48%, #6228d7 100%)",
});

// const dateFieldStyle: CSSProperties = {
//   flex: 1,
//   minWidth: 0,
// };

const channelTypeIcon = (type: ConversationChannel) =>
  type === "telegram" ? (
    <TelegramLogoIcon size={12} weight="fill" />
  ) : (
    <InstagramLogoIcon size={12} weight="regular" />
  );

type ConversationFiltersPopoverProps = {
  size?: "middle" | "large";
};

export const ConversationFiltersPopover = observer(
  ({ size = "middle" }: ConversationFiltersPopoverProps) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const conversationsStore = useConversationsStore();
    const [open, setOpen] = useState(false);
    const [criteria, setCriteria] =
      useState<ConversationCriteria>(EMPTY_CRITERIA);
    const [criteriaLoading, setCriteriaLoading] = useState(false);
    const [criteriaError, setCriteriaError] = useState<string | null>(null);
    const [draftChannelIds, setDraftChannelIds] = useState<number[]>([]);
    const [draftResponsibleUserIds, setDraftResponsibleUserIds] = useState<
      number[]
    >([]);

    const appliedChannelIdsKey =
      conversationsStore.conversationListChannelIds.join(",");
    const appliedResponsibleUserIdsKey =
      conversationsStore.conversationListResponsibleUserIds.join(",");

    useEffect(() => {
      if (!open) {
        return;
      }

      setDraftChannelIds([...conversationsStore.conversationListChannelIds]);
      setDraftResponsibleUserIds([
        ...conversationsStore.conversationListResponsibleUserIds,
      ]);
    }, [
      appliedChannelIdsKey,
      appliedResponsibleUserIdsKey,
      conversationsStore,
      open,
    ]);

    useEffect(() => {
      if (!open) {
        return;
      }

      let cancelled = false;
      setCriteriaLoading(true);
      setCriteriaError(null);

      void conversationsApi
        .criteria()
        .then((nextCriteria) => {
          if (!cancelled) {
            setCriteria(nextCriteria);
          }
        })
        .catch((error) => {
          if (cancelled) {
            return;
          }

          setCriteria(EMPTY_CRITERIA);
          setCriteriaError(
            getApiErrorMessage(
              error,
              t("conversations.filterPopover.criteriaLoadError"),
            ),
          );
        })
        .finally(() => {
          if (!cancelled) {
            setCriteriaLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [open, t]);

    const channelsByType = useMemo(() => {
      return CHANNEL_TYPES.reduce(
        (acc, type) => {
          acc[type] = criteria.channels
            .filter((channel) => channel.type === type)
            .sort((a, b) => a.name.localeCompare(b.name));

          return acc;
        },
        {
          instagram: [],
          telegram: [],
        } as Record<ConversationChannel, ConversationCriteria["channels"]>,
      );
    }, [criteria.channels]);

    const responsibleUsers = useMemo(
      () =>
        [...criteria.responsibleUsers].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      [criteria.responsibleUsers],
    );

    const toggleChannel = (integrationId: number, checked: boolean): void => {
      setDraftChannelIds((current) =>
        normalizeDraftIds(
          checked
            ? [...current, integrationId]
            : current.filter((id) => id !== integrationId),
        ),
      );
    };

    const toggleChannelType = (
      type: ConversationChannel,
      checked: boolean,
    ): void => {
      const typeIds = channelsByType[type].map(
        (channel) => channel.integrationId,
      );

      setDraftChannelIds((current) => {
        const next = new Set(current);

        typeIds.forEach((id) => {
          if (checked) {
            next.add(id);
          } else {
            next.delete(id);
          }
        });

        return normalizeDraftIds([...next]);
      });
    };

    const toggleResponsibleUser = (userId: number, checked: boolean): void => {
      setDraftResponsibleUserIds((current) =>
        normalizeDraftIds(
          checked
            ? [...current, userId]
            : current.filter((id) => id !== userId),
        ),
      );
    };

    const handleCancel = (): void => {
      setOpen(false);
    };

    const handleApply = (): void => {
      conversationsStore.applyConversationListFilters({
        channelIds: draftChannelIds,
        responsibleUserIds: draftResponsibleUserIds,
      });
      setOpen(false);
    };

    const renderSectionTitle = (children: ReactNode) => (
      <Typography.Text strong type="secondary" style={sectionTitleStyle}>
        {children}
      </Typography.Text>
    );

    const renderLabel = (children: ReactNode) => (
      <Typography.Text ellipsis>{children}</Typography.Text>
    );

    const renderEmptyText = (children: ReactNode) => (
      <Typography.Text type="secondary">{children}</Typography.Text>
    );

    const renderChannelCheckboxChildren = (
      type: ConversationChannel,
      label: string,
    ) => (
      <Flex align="center" gap={14} style={{ minWidth: 0 }}>
        <Avatar size={26} style={sourceIconStyle(type)}>
          {channelTypeIcon(type)}
        </Avatar>
        {renderLabel(label)}
      </Flex>
    );

    const renderChannels = () => {
      if (criteria.channels.length === 0) {
        return renderEmptyText(t("conversations.filterPopover.noChannels"));
      }

      return CHANNEL_TYPES.map((type) => {
        const channels = channelsByType[type];

        if (channels.length === 0) {
          return null;
        }

        const selectedCount = channels.filter((channel) =>
          draftChannelIds.includes(channel.integrationId),
        ).length;
        const allSelected = selectedCount === channels.length;
        const partiallySelected = selectedCount > 0 && !allSelected;

        return (
          <Flex key={type} vertical gap={10}>
            <Checkbox
              checked={allSelected}
              indeterminate={partiallySelected}
              style={checkboxRowStyle}
              onChange={(event) =>
                toggleChannelType(type, event.target.checked)
              }
            >
              {renderChannelCheckboxChildren(
                type,
                t(`conversations.filterPopover.allChannels.${type}`),
              )}
            </Checkbox>

            {channels.map((channel) => (
              <Checkbox
                key={channel.integrationId}
                checked={draftChannelIds.includes(channel.integrationId)}
                style={indentedCheckboxRowStyle}
                onChange={(event) =>
                  toggleChannel(channel.integrationId, event.target.checked)
                }
              >
                {renderLabel(channel.name)}
              </Checkbox>
            ))}
          </Flex>
        );
      });
    };

    const content = (
      <Flex vertical style={getPanelStyle(token)}>
        <Flex vertical style={panelHeaderStyle}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t("conversations.filterPopover.title")}
          </Typography.Title>
        </Flex>

        <Flex vertical style={panelBodyStyle(token)}>
          {criteriaLoading ? (
            <Flex align="center" justify="center" style={{ height: "100%" }}>
              <Spin />
            </Flex>
          ) : (
            <>
              {criteriaError && (
                <Typography.Text type="danger">{criteriaError}</Typography.Text>
              )}

              <Flex vertical gap={14}>
                {renderSectionTitle(t("conversations.filterPopover.channels"))}
                <Flex vertical gap={14}>
                  {renderChannels()}
                </Flex>
              </Flex>

              <Divider style={{ margin: "20px 0" }} />

              <Flex vertical gap={14}>
                {renderSectionTitle(
                  t("conversations.filterPopover.responsibleUsers"),
                )}
                {responsibleUsers.length > 0 ? (
                  <Flex vertical gap={10}>
                    {responsibleUsers.map((user) => (
                      <Checkbox
                        key={user.id}
                        checked={draftResponsibleUserIds.includes(user.id)}
                        style={checkboxRowStyle}
                        onChange={(event) =>
                          toggleResponsibleUser(user.id, event.target.checked)
                        }
                      >
                        <Flex align="center" gap={14} style={{ minWidth: 0 }}>
                          <UserAvatar
                            size={36}
                            name={user.name || user.email}
                            src={user.avatar}
                          />
                          {renderLabel(user.name || user.email)}
                        </Flex>
                      </Checkbox>
                    ))}
                  </Flex>
                ) : (
                  renderEmptyText(
                    t("conversations.filterPopover.noResponsibleUsers"),
                  )
                )}
              </Flex>

              {/* <Divider style={{ margin: "20px 0" }} />

              <Flex vertical gap={14}>
                {renderSectionTitle(t("conversations.filterPopover.dates"))}
                <Flex gap={20}>
                  <Flex vertical gap={8} style={dateFieldStyle}>
                    <Typography.Text type="secondary">
                      {t("conversations.filterPopover.firstMessageDate")}
                    </Typography.Text>
                    <DatePicker
                      disabled
                      format="DD.MM.YYYY"
                      placeholder={t(
                        "conversations.filterPopover.datePlaceholder",
                      )}
                      style={{ width: "100%" }}
                    />
                  </Flex>
                  <Flex vertical gap={8} style={dateFieldStyle}>
                    <Typography.Text type="secondary">
                      {t("conversations.filterPopover.lastMessageDate")}
                    </Typography.Text>
                    <DatePicker
                      disabled
                      format="DD.MM.YYYY"
                      placeholder={t(
                        "conversations.filterPopover.datePlaceholder",
                      )}
                      style={{ width: "100%" }}
                    />
                  </Flex>
                </Flex>
              </Flex> */}
            </>
          )}
        </Flex>

        <Flex gap={16} style={{ padding: "8px 0" }}>
          <Button block onClick={handleCancel}>
            {t("conversations.filterPopover.cancel")}
          </Button>
          <Button type="primary" block onClick={handleApply}>
            {t("conversations.filterPopover.apply")}
          </Button>
        </Flex>
      </Flex>
    );

    return (
      <Popover
        arrow={false}
        content={content}
        destroyOnHidden
        open={open}
        placement="bottomRight"
        trigger="click"
        styles={{
          content: { padding: 0 },
        }}
        onOpenChange={setOpen}
      >
        <Button
          aria-expanded={open}
          aria-label={t('conversations.filtersAria')}
          color={
            conversationsStore.hasConversationListFilters
              ? 'primary'
              : 'default'
          }
          size={size}
          style={{ padding: '0 8px' }}
          variant="filled"
        >
          <FunnelIcon size={18} weight="regular" />
        </Button>
      </Popover>
    );
  },
);
