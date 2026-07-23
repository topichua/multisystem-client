import { CheckIcon, SquaresFourIcon } from "@phosphor-icons/react";
import { Button, Dropdown, Typography, theme } from "antd";
import type { ButtonProps, MenuProps } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { ConversationGroupingBy } from "@/features/conversations/api/conversations-api";
import { useConversationsStore } from "@/features/conversations/model/use-conversations-store";

const NO_GROUPING_KEY = "none";

const GROUPING_OPTIONS: readonly {
  key: typeof NO_GROUPING_KEY | ConversationGroupingBy;
  labelKey: string;
}[] = [
  {
    key: NO_GROUPING_KEY,
    labelKey: "conversations.grouping.none",
  },
  {
    key: "responsible",
    labelKey: "conversations.grouping.responsible",
  },
  {
    key: "status",
    labelKey: "conversations.grouping.status",
  },
  {
    key: "createdAt",
    labelKey: "conversations.grouping.createdAt",
  },
  {
    key: "channel",
    labelKey: "conversations.grouping.channel",
  },
];

type ConversationGroupingDropdownProps = {
  size?: ButtonProps["size"];
};

const isConversationGroupingBy = (
  value: string,
): value is ConversationGroupingBy =>
  value === "responsible" ||
  value === "status" ||
  value === "createdAt" ||
  value === "channel";

const emptyMenuIcon = (
  <span style={{ display: "inline-flex", width: 14 }} aria-hidden="true" />
);

export const ConversationGroupingDropdown = observer(
  ({ size = "middle" }: ConversationGroupingDropdownProps) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const conversationsStore = useConversationsStore();
    const [open, setOpen] = useState(false);

    const selectedKey =
      conversationsStore.conversationGroupingBy ?? NO_GROUPING_KEY;
    const active = open || conversationsStore.conversationGroupingBy != null;

    const menuItems = useMemo<MenuProps["items"]>(
      () => [
        {
          key: "grouping",
          type: "group",
          label: (
            <Typography.Text
              type="secondary"
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0,
                textTransform: "uppercase",
              }}
            >
              {t("conversations.grouping.title")}
            </Typography.Text>
          ),
          children: GROUPING_OPTIONS.map((option) => {
            const selected = option.key === selectedKey;

            return {
              key: option.key,
              icon: selected ? (
                <CheckIcon size={14} color={token.colorPrimary} />
              ) : (
                emptyMenuIcon
              ),
              label: (
                <Typography.Text
                  style={
                    selected
                      ? {
                          color: token.colorPrimary,
                          fontWeight: 500,
                        }
                      : undefined
                  }
                >
                  {t(option.labelKey)}
                </Typography.Text>
              ),
            };
          }),
        },
      ],
      [selectedKey, t, token.colorPrimary],
    );

    const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
      if (key === NO_GROUPING_KEY) {
        conversationsStore.setConversationGroupingBy(null);
        return;
      }

      if (isConversationGroupingBy(key)) {
        conversationsStore.setConversationGroupingBy(key);
      }
    };

    return (
      <Dropdown
        menu={{
          items: menuItems,
          onClick: handleMenuClick,
        }}
        open={open}
        placement="bottomRight"
        trigger={["click"]}
        onOpenChange={setOpen}
      >
        <Button
          aria-expanded={open}
          aria-label={t("conversations.grouping.aria")}
          icon={<SquaresFourIcon size={22} />}
          size={size}
          style={{
            padding: "0 8px",
            ...(active
              ? {
                  background: token.colorPrimaryBg,
                  color: token.colorPrimary,
                }
              : undefined),
          }}
          type="text"
        />
      </Dropdown>
    );
  },
);
