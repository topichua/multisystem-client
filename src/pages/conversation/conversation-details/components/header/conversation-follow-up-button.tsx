import { CaretDownIcon, ClockIcon, XIcon } from "@phosphor-icons/react";
import { Button, Dropdown, type MenuProps } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type { ConversationFollowUp } from "@/features/conversations/model/types";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";
import { formatFollowUpSchedule } from "@/utils/date-time";
import { useNotification } from "@/shared/components/notification/use-notification";
import { useIsMobileViewport } from "@/utils/use-media-query";

import { ConversationFollowUpModal } from "./conversation-follow-up-modal";
import * as S from "./header.styled";

type ConversationFollowUpButtonProps = {
  conversationId?: string;
  followUp?: ConversationFollowUp | null;
  disabled?: boolean;
};

export const ConversationFollowUpButton = ({
  conversationId,
  followUp = null,
  disabled = false,
}: ConversationFollowUpButtonProps) => {
  const { t } = useTranslation();
  const isMobileViewport = useIsMobileViewport();
  const notification = useNotification();
  const conversationsStore = useConversationsStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

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

  return (
    <>
      {hasScheduledFollowUp ? (
        <Dropdown
          trigger={["click"]}
          disabled={disabled}
          menu={{ items: menuItems, onClick: handleMenuClick }}
        >
          <S.ScheduledFollowUpButton
            shape="round"
            className="conversation-follow-up-toggle"
            disabled={disabled || cancelling}
            loading={cancelling}
            icon={<ClockIcon size={16} />}
            aria-label={t("conversation.followUp.scheduledAria", {
              when: scheduledLabel,
            })}
            aria-haspopup="menu"
            data-qa="layout-conversation-details-follow-up-toggle"
          >
            {scheduledLabel}
            <CaretDownIcon size={12} />
          </S.ScheduledFollowUpButton>
        </Dropdown>
      ) : (
        <Button
          color="default"
          variant="outlined"
          shape="round"
          className="conversation-follow-up-toggle"
          icon={<ClockIcon size={16} />}
          disabled={disabled}
          aria-label={t("conversation.followUp.openAria")}
          aria-haspopup="dialog"
          aria-expanded={modalOpen}
          data-qa="layout-conversation-details-follow-up-toggle"
          style={{ height: 35 }}
          onClick={() => setModalOpen(true)}
        >
          {isMobileViewport ? null : t("conversation.followUp.button")}
        </Button>
      )}

      <ConversationFollowUpModal
        open={modalOpen}
        conversationId={conversationId}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};
