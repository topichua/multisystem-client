import {
  ArrowBendDoubleUpLeftIcon,
  DotsThreeVerticalIcon,
} from "@phosphor-icons/react";
import { Dropdown, Tooltip } from "antd";
import type { MenuProps } from "antd";

import * as S from "./message-item.styled";

type MessageInlineActionsProps = {
  visible: boolean;
  canReply: boolean;
  menuOpen: boolean;
  menuItems: MenuProps["items"];
  placement: "bottomLeft" | "bottomRight";
  replyTooltip: string;
  replyAria: string;
  actionsAria: string;
  onReply: () => void;
  onDropdownOpenChange: (open: boolean) => void;
};

export const MessageInlineActions = ({
  visible,
  canReply,
  menuOpen,
  menuItems,
  placement,
  replyTooltip,
  replyAria,
  actionsAria,
  onReply,
  onDropdownOpenChange,
}: MessageInlineActionsProps) => (
  <S.MessageInlineActions
    $visible={visible}
    onMouseDown={(event) => event.stopPropagation()}
    onClick={(event) => event.stopPropagation()}
  >
    {canReply && (
      <Tooltip title={replyTooltip} mouseEnterDelay={0.35}>
        <S.IconHitButton type="button" onClick={onReply} aria-label={replyAria}>
          <ArrowBendDoubleUpLeftIcon size={20} weight="regular" />
        </S.IconHitButton>
      </Tooltip>
    )}
    <Dropdown
      menu={{ items: menuItems }}
      trigger={["click"]}
      placement={placement}
      onOpenChange={onDropdownOpenChange}
    >
      <S.IconHitButton
        type="button"
        aria-label={actionsAria}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <DotsThreeVerticalIcon size={20} weight="regular" />
      </S.IconHitButton>
    </Dropdown>
  </S.MessageInlineActions>
);
