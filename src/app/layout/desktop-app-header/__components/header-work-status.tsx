import { CaretDownIcon, CaretUpIcon, CheckIcon } from "@phosphor-icons/react";
import { Dropdown, Typography } from "antd";
import type { MenuProps } from "antd";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import type { MemberWorkStatus } from "@/features/auth/model/auth-session.types";
import { useUserStore } from "@/features/auth/model/use-user-store";
import { MemberWorkStatusLabel } from "@/shared/components/member-work-status/member-work-status-label";
import { MemberWorkStatusDot } from "@/shared/components/member-work-status/member-work-status.styled";
import { getMemberWorkStatusColors } from "@/shared/components/member-work-status/member-work-status";
import { useNotification } from "@/shared/components/notification/use-notification";

import * as S from "../desktop-app-header.styled";

const WORK_STATUS_OPTIONS: readonly MemberWorkStatus[] = [
  "accepting_new_chats",
  "not_accepting_new_chats",
  "break",
];

const isWorkStatus = (value: string): value is MemberWorkStatus =>
  WORK_STATUS_OPTIONS.some((status) => status === value);

export const HeaderWorkStatus = observer(() => {
  const { t } = useTranslation();
  const theme = useTheme();
  const notification = useNotification();
  const userStore = useUserStore();
  const [workStatusOpen, setWorkStatusOpen] = useState(false);

  const workStatus = userStore.workStatus;
  const workStatusColors = getMemberWorkStatusColors(theme);

  const handleWorkStatusClick: NonNullable<MenuProps["onClick"]> = ({
    key,
  }) => {
    if (!isWorkStatus(key)) {
      return;
    }

    void userStore.updateWorkStatus(key).catch((error) => {
      notification.error({
        title: getApiErrorMessage(error, t("appHeader.workStatus.updateError")),
      });
    });
  };

  const workStatusMenuItems: MenuProps["items"] = [
    {
      key: "work-status",
      type: "group",
      label: (
        <Typography.Text
          type="secondary"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.3,
            textTransform: "uppercase",
          }}
        >
          {t("appHeader.workStatus.title")}
        </Typography.Text>
      ),
      children: WORK_STATUS_OPTIONS.map((status) => {
        const selected = status === workStatus;

        return {
          key: status,
          disabled: userStore.workStatusUpdating,
          label: (
            <S.StatusMenuItem>
              <S.StatusMenuItemContent>
                <MemberWorkStatusDot $color={workStatusColors[status]} />

                <S.StatusMenuItemLabel $selected={selected}>
                  {t(`appHeader.workStatus.${status}.menu`)}
                </S.StatusMenuItemLabel>
              </S.StatusMenuItemContent>

              {selected && (
                <S.StatusMenuCheck>
                  <CheckIcon size={14} weight="bold" />
                </S.StatusMenuCheck>
              )}
            </S.StatusMenuItem>
          ),
        };
      }),
    },
  ];

  return (
    <S.StatusButtonWrapper>
      <Dropdown
        trigger={["click"]}
        placement="bottomRight"
        open={workStatusOpen}
        onOpenChange={setWorkStatusOpen}
        menu={{
          items: workStatusMenuItems,
          onClick: handleWorkStatusClick,
        }}
      >
        <S.StyledStatusButton
          aria-expanded={workStatusOpen}
          aria-label={t("appHeader.workStatus.aria")}
          data-qa="layout-desktop-work-status"
        >
          <MemberWorkStatusLabel status={workStatus} />

          {workStatusOpen ? <CaretUpIcon /> : <CaretDownIcon />}
        </S.StyledStatusButton>
      </Dropdown>
    </S.StatusButtonWrapper>
  );
});
