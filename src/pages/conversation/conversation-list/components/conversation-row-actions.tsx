import { Button, Dropdown } from "antd";
import type { MenuProps } from "antd";
import type { SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";

import * as S from "../conversation.styled";
import ThreeDots from "../ThreeDotsIcon.svg?react";

type ConversationRowActionsProps = {
  menuItems: MenuProps["items"];
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onStopRowActivation: (event: SyntheticEvent) => void;
};

export const ConversationRowActions = ({
  menuItems,
  menuOpen,
  onMenuOpenChange,
  onStopRowActivation,
}: ConversationRowActionsProps) => {
  const { t } = useTranslation();

  return (
    <S.ConversationRowActions
      data-conversation-actions
      onClick={onStopRowActivation}
      onMouseDown={onStopRowActivation}
      onPointerDown={onStopRowActivation}
      onKeyDown={onStopRowActivation}
    >
      <Dropdown
        menu={{ items: menuItems }}
        placement="bottomRight"
        trigger={["click"]}
        onOpenChange={onMenuOpenChange}
      >
        <Button
          type="default"
          size="small"
          aria-label={t("conversations.rowActionsAria")}
          aria-expanded={menuOpen}
          icon={<ThreeDots width={16} height={16} aria-hidden="true" />}
        />
      </Dropdown>
    </S.ConversationRowActions>
  );
};
