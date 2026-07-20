import { ArrowLeftIcon, CaretRightIcon, PlusIcon } from "@phosphor-icons/react";
import { Alert, Empty } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useNavigate, useOutletContext } from "react-router";

import { getTeamRolePath, pagesMap } from "@/app/router/pages-map";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { useWorkspaceRolesStore } from "@/features/workspace-roles/model/use-workspace-roles-store";
import { DEFAULT_COLOR_PRESET } from "@/shared/components/preset-color-picker/color-presets";
import { RoleDot } from "@/shared/components/role-dot/role-dot";

import type { TeamRolesOutletContext } from "../team-roles-page";
import * as S from "./mobile-team-roles-list-page.styled";

export const MobileTeamRolesListPage = observer(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const store = useWorkspaceRolesStore();
  const { onCreateClick } = useOutletContext<TeamRolesOutletContext>();
  const roles = store.sortedRoles;

  return (
    <S.Root>
      <S.Header>
        <S.TitleCluster>
          <S.BackButton
            type="text"
            icon={<ArrowLeftIcon size={20} />}
            aria-label={t("team.mobile.backToTeamAria")}
            data-qa="team-mobile-roles-back"
            onClick={() => navigate(pagesMap.team)}
          />
          <S.PageTitle level={3}>{t("team.rolesTitle")}</S.PageTitle>
        </S.TitleCluster>
        <S.CreateButton
          type="primary"
          icon={<PlusIcon size={16} />}
          aria-label={t("team.mobile.createRoleAria")}
          data-qa="team-mobile-roles-create"
          onClick={onCreateClick}
        >
          <S.CreateButtonLabel>{t("team.createRole")}</S.CreateButtonLabel>
        </S.CreateButton>
      </S.Header>

      <S.ScrollRegion>
        {store.listError && (
          <Alert
            type="error"
            title={store.listError}
            showIcon
            style={{ marginTop: 16 }}
          />
        )}

        {store.listLoading && roles.length === 0 ? (
          <S.StateContainer>
            <CenteredSpinner minHeight={160} />
          </S.StateContainer>
        ) : roles.length === 0 ? (
          <S.StateContainer>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("team.rolesEmpty")}
            />
          </S.StateContainer>
        ) : (
          <S.ListCard>
            {roles.map((role) => (
              <S.RoleItemButton
                key={role.id}
                type="text"
                block
                data-qa={`team-mobile-role-item-${role.id}`}
                onClick={() => navigate(getTeamRolePath(role.id))}
              >
                <S.ItemContent align="center" gap={12}>
                  <S.ColorIconSlot aria-hidden="true">
                    <RoleDot color={role.color ?? DEFAULT_COLOR_PRESET} />
                  </S.ColorIconSlot>
                  <S.ItemCopy vertical gap={role.membersCount != null ? 2 : 0}>
                    <S.ItemTitle>{role.name}</S.ItemTitle>
                    {role.membersCount != null && (
                      <S.ItemPreview>
                        {t("team.roleMembersCount", {
                          count: role.membersCount,
                        })}
                      </S.ItemPreview>
                    )}
                  </S.ItemCopy>
                  <S.Caret aria-hidden="true">
                    <CaretRightIcon size={18} />
                  </S.Caret>
                </S.ItemContent>
              </S.RoleItemButton>
            ))}
          </S.ListCard>
        )}
      </S.ScrollRegion>
    </S.Root>
  );
});
