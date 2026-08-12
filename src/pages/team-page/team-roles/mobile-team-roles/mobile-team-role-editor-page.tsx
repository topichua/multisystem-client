import { ArrowLeftIcon } from "@phosphor-icons/react";
import {
  Alert,
  Button,
  Empty,
  Flex,
  Form,
  Input,
  Popconfirm,
  Typography,
} from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { DEFAULT_COLOR_PRESET } from "@/shared/components/preset-color-picker/color-presets";
import { PresetColorPicker } from "@/shared/components/preset-color-picker/preset-color-picker";
import { RoleDot } from "@/shared/components/role-dot/role-dot";

import { TeamRolePermissionsForm } from "../team-role-permissions-form";
import { useTeamRoleEditor } from "../use-team-role-editor";
import * as S from "./mobile-team-role-editor-page.styled";

const { Text, Title } = Typography;

export const MobileTeamRoleEditorPage = observer(() => {
  const { t } = useTranslation();
  const { roleId } = useParams<{ roleId: string }>();
  const {
    role,
    form,
    store,
    integrationGrants,
    integrationGrantsError,
    integrationGrantsLoading,
    productReferenceGrants,
    productReferenceGrantsError,
    productReferenceGrantsLoading,
    relatedGrantsLoading,
    isInvalidId,
    isLoading,
    isNotFound,
    showCatalogLoader,
    handleSave,
    handleDelete,
    navigateToRoles,
  } = useTeamRoleEditor(roleId);

  if (isInvalidId) {
    return (
      <S.Root>
        <S.StateContainer>
          <Alert type="error" title={t("team.invalidRole")} showIcon />
        </S.StateContainer>
      </S.Root>
    );
  }

  if (isLoading) {
    return (
      <S.Root>
        <S.StateContainer>
          <CenteredSpinner />
        </S.StateContainer>
      </S.Root>
    );
  }

  if (isNotFound) {
    return (
      <S.Root>
        <S.StateContainer>
          <Alert
            type="warning"
            title={t("team.roleNotFoundTitle")}
            description={t("team.roleNotFoundDescription")}
            showIcon
            action={
              <Button size="small" onClick={navigateToRoles}>
                {t("team.backToRoles")}
              </Button>
            }
          />
        </S.StateContainer>
      </S.Root>
    );
  }

  if (!role) {
    return null;
  }

  const pageTitle = role.name.trim() || t("team.mobile.editorFallbackTitle");

  return (
    <S.Root>
      <S.PageHeader>
        <S.BackButton
          type="text"
          icon={<ArrowLeftIcon size={16} />}
          aria-label={t("team.mobile.backToRolesAria")}
          data-qa="team-mobile-role-back"
          onClick={navigateToRoles}
        >
          {t("team.backToRoles")}
        </S.BackButton>

        <S.HeaderRow align="center" gap={8}>
          <RoleDot color={role.color ?? DEFAULT_COLOR_PRESET} size={15} />
          <S.PageTitle level={4}>{pageTitle}</S.PageTitle>
        </S.HeaderRow>
      </S.PageHeader>

      <S.ScrollRegion>
        {showCatalogLoader ? (
          <S.StateContainer>
            <CenteredSpinner />
          </S.StateContainer>
        ) : store.catalogError && !store.catalog ? (
          <S.StateContainer>
            <Alert
              type="error"
              title={t("team.rolesCatalogError")}
              description={store.catalogError}
              showIcon
            />
          </S.StateContainer>
        ) : store.catalog ? (
          <S.FormSection>
            <Form
              form={form}
              layout="vertical"
              onFinish={() => void handleSave()}
            >
              <Flex vertical gap={16}>
                <Form.Item
                  name="name"
                  label={t("team.roleName")}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: t("team.roleNameRequired"),
                    },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="description"
                  label={t("team.roleDescription")}
                  style={{ marginBottom: 0 }}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item
                  name="color"
                  label={t("team.roleColor")}
                  style={{ marginBottom: 0 }}
                >
                  <PresetColorPicker
                    ariaLabel={t("team.roleColorPickerAria")}
                    columns={5}
                  />
                </Form.Item>
                <Flex vertical gap={4}>
                  <Title level={4} style={{ margin: 0 }}>
                    {t("team.rolesPermissionsTitle")}
                  </Title>
                  <Text type="secondary">
                    {t("team.rolesPermissionsSubtitle")}
                  </Text>
                </Flex>
                <S.PermissionsRegion>
                  <TeamRolePermissionsForm
                    layoutVariant="mobile"
                    integrationGrants={integrationGrants}
                    integrationGrantsError={integrationGrantsError}
                    integrationGrantsLoading={integrationGrantsLoading}
                    productReferenceGrants={productReferenceGrants}
                    productReferenceGrantsError={productReferenceGrantsError}
                    productReferenceGrantsLoading={
                      productReferenceGrantsLoading
                    }
                    schema={store.catalog}
                  />
                </S.PermissionsRegion>
              </Flex>
            </Form>
          </S.FormSection>
        ) : (
          <S.StateContainer>
            <Empty description={t("team.rolesCatalogError")} />
          </S.StateContainer>
        )}

        {store.catalog && (
          <S.StickyFooter>
            <S.FooterActions vertical gap={8}>
              <Button
                type="primary"
                block
                loading={
                  store.saveLoading ||
                  store.integrationGrantsSaveLoadingRoleId === role.id ||
                  store.productReferenceGrantsSaveLoadingRoleId === role.id
                }
                disabled={!store.catalog || relatedGrantsLoading}
                data-qa="team-mobile-role-save"
                onClick={() => void handleSave()}
              >
                {t("team.saveRole")}
              </Button>
              <Popconfirm
                title={t("team.roleDeleteConfirmTitle")}
                okText={t("team.deleteRole")}
                okButtonProps={{
                  danger: true,
                  loading: store.deleteLoadingId === role.id,
                }}
                onConfirm={() =>
                  void handleDelete({ navigateToRolesList: true })
                }
              >
                <Button
                  danger
                  block
                  loading={store.deleteLoadingId === role.id}
                  data-qa="team-mobile-role-delete"
                >
                  {t("team.deleteRole")}
                </Button>
              </Popconfirm>
            </S.FooterActions>
          </S.StickyFooter>
        )}
      </S.ScrollRegion>
    </S.Root>
  );
});
