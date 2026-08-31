import { ClockIcon, XIcon } from "@phosphor-icons/react";
import { Dropdown, Tooltip, type MenuProps } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobileViewport } from "@/utils/use-media-query";
import { getApiErrorMessage } from "@/api/get-api-error-message";
import type { ConversationFollowUp } from "@/features/conversations/model/types";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";
import { formatFollowUpSchedule } from "@/utils/date-time";
import { useNotification } from "@/shared/components/notification/use-notification";

import { ConversationFollowUpModal } from "./conversation-follow-up-modal";
import * as S from "./header.styled";

type ConversationFollowUpButtonProps = {
  conversationId?: string;
  followUp?: ConversationFollowUp | null;
  disabled?: boolean;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
};

export const ConversationFollowUpButton = ({
  conversationId,
  followUp = null,
  disabled = false,
  getPopupContainer,
}: ConversationFollowUpButtonProps) => {
  const { t } = useTranslation();
  const notification = useNotification();
  const conversationsStore = useConversationsStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const isMobileViewport = useIsMobileViewport();

  const scheduledLabel = followUp
    ? formatFollowUpSchedule(followUp.scheduledAt)
    : "";
  const hasScheduledFollowUp = followUp != null && scheduledLabel !== "";

  const menuItems = useMemo<MenuProps["items"]>(
    () => [
      {
        key: "edit",
        icon: <ClockIcon size={16} />,
        label: t("conversation.followUp.changeTime"),
      },
      {
        key: "cancel",
        icon: <XIcon size={16} />,
        disabled: cancelling,
        label: t("conversation.followUp.cancelReminder"),
      },
    ],
    [cancelling, t],
  );

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "edit") {
      setModalOpen(true);
      return;
    }

    if (key !== "cancel" || !conversationId) {
      return;
    }

    setCancelling(true);

    void conversationsStore
      .cancelConversationFollowUp(conversationId)
      .then(() => {
        notification.success({
          title: t("conversation.followUp.cancelSuccess"),
        });
      })
      .catch((error: unknown) => {
        notification.error({
          title: getApiErrorMessage(
            error,
            t("conversation.followUp.cancelError"),
          ),
        });
      })
      .finally(() => {
        setCancelling(false);
      });
  };

  const isFollowUpDisabled = disabled || cancelling;

  const followUpButton = (
    <Tooltip
      title={
        hasScheduledFollowUp
          ? t("conversation.followUp.scheduledTooltip", {
              when: scheduledLabel,
            })
          : t("conversation.followUp.button")
      }
    >
      <S.FollowUpButton
        $scheduled={hasScheduledFollowUp}
        className="conversation-follow-up-toggle"
        disabled={isFollowUpDisabled}
        loading={hasScheduledFollowUp && cancelling}
        icon={<ClockIcon size={16} />}
        data-qa="layout-conversation-details-follow-up-toggle"
        onClick={hasScheduledFollowUp ? undefined : () => setModalOpen(true)}
        type={isMobileViewport ? "default" : "text"}
      >
        {isMobileViewport ? t("conversation.followUp.button") : null}
      </S.FollowUpButton>
    </Tooltip>
  );

  return (
    <>
      {hasScheduledFollowUp ? (
        <Dropdown
          trigger={["click"]}
          disabled={isFollowUpDisabled}
          getPopupContainer={getPopupContainer}
          menu={{
            items: menuItems,
            onClick: handleMenuClick,
          }}
        >
          {followUpButton}
        </Dropdown>
      ) : (
        followUpButton
      )}

      <ConversationFollowUpModal
        open={modalOpen}
        conversationId={conversationId}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};
