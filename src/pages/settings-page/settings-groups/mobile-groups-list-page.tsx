import { ArrowLeftIcon, CaretRightIcon, PlusIcon } from "@phosphor-icons/react";
import { Empty } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useOutletContext } from "react-router";

import { getSettingsGroupPath, pagesMap } from "@/app/router/pages-map";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { useConversationGroupsStore } from "@/features/conversation-groups/model/use-conversation-groups-store";

import type { SettingsGroupsOutletContext } from "./settings-groups-layout";
import * as S from "./mobile-groups-list-page.styled";

export const MobileGroupsListPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const store = useConversationGroupsStore();
  const { onCreateClick } = useOutletContext<SettingsGroupsOutletContext>();

  const sortedGroups = useMemo(
    () => [...store.groups].sort((a, b) => a.sortOrder - b.sortOrder),
    [store.groups],
  );

  return (
    <S.Root>
      <S.Header>
        <S.TitleRow>
          <S.BackButton
            type="text"
            icon={<ArrowLeftIcon size={20} />}
            aria-label={t("groups.mobile.backToSettingsAria")}
            data-qa="settings-mobile-groups-back"
            onClick={() => navigate(pagesMap.settings)}
          />
          <S.PageTitle level={3}>{t("groups.title")}</S.PageTitle>
        </S.TitleRow>
        <S.CreateButton
          type="primary"
          icon={<PlusIcon />}
          aria-label={t("groups.mobile.createGroupAria")}
          data-qa="settings-mobile-groups-create"
          onClick={onCreateClick}
        >
          <S.CreateButtonLabel>{t("groups.createGroup")}</S.CreateButtonLabel>
        </S.CreateButton>
      </S.Header>

      {store.listLoading && sortedGroups.length === 0 ? (
        <S.StateContainer>
          <CenteredSpinner minHeight={160} />
        </S.StateContainer>
      ) : sortedGroups.length === 0 ? (
        <S.StateContainer>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("groups.noGroupsYet")}
          />
        </S.StateContainer>
      ) : (
        <S.ListCard>
          {sortedGroups.map((group) => {
            const secondaryLine = group.description.trim();

            return (
              <S.GroupItemButton
                key={group.id}
                type="text"
                block
                data-qa={`settings-mobile-group-item-${group.id}`}
                onClick={() => navigate(getSettingsGroupPath(group.id))}
              >
                <S.ItemContent align="center" gap={12}>
                  <S.ColorIconSlot aria-hidden="true">
                    <S.ColorDot $color={group.color} />
                  </S.ColorIconSlot>
                  <S.ItemCopy vertical gap={secondaryLine ? 2 : 0}>
                    <S.ItemTitle>{group.name}</S.ItemTitle>
                    {secondaryLine && (
                      <S.ItemPreview>{secondaryLine}</S.ItemPreview>
                    )}
                  </S.ItemCopy>
                  <S.Caret aria-hidden="true">
                    <CaretRightIcon size={18} />
                  </S.Caret>
                </S.ItemContent>
              </S.GroupItemButton>
            );
          })}
        </S.ListCard>
      )}
    </S.Root>
  );
});
