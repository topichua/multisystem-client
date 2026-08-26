import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Alert, Button, Form, Popconfirm } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { getConversationGroupDisplayName } from "@/features/conversation-groups/model/system-groups";

import { ConversationGroupSystemBadge } from "./conversation-group-system-badge";
import { GroupFormFields } from "./group-form-fields";
import * as S from "./mobile-group-editor-page.styled";
import { useSettingsGroupEditor } from "./use-settings-group-editor";

export const MobileGroupEditorPage = observer(() => {
  const { t } = useTranslation();
  const { groupId } = useParams<{ groupId: string }>();
  const {
    group,
    form,
    store,
    isInvalidId,
    isLoading,
    isNotFound,
    handleSave,
    handleDelete,
    navigateToGroups,
    isReadOnly,
  } = useSettingsGroupEditor(groupId);

  if (isInvalidId) {
    return (
      <S.Root>
        <S.StateContainer>
          <Alert type="error" title={t("groups.invalidGroup")} showIcon />
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
            title={t("groups.notFoundTitle")}
            description={t("groups.notFoundDescription")}
            showIcon
            action={
              <Button size="small" onClick={navigateToGroups}>
                {t("groups.backToGroups")}
              </Button>
            }
          />
        </S.StateContainer>
      </S.Root>
    );
  }

  if (!group) {
    return null;
  }

  const pageTitle =
    getConversationGroupDisplayName(group, t).trim() ||
    t("groups.mobile.editorFallbackTitle");

  return (
    <S.Root>
      <S.PageHeader>
        <S.BackButton
          type="text"
          icon={<ArrowLeftIcon size={16} />}
          data-qa="settings-mobile-group-back"
          onClick={navigateToGroups}
        >
          {t("groups.backToGroups")}
        </S.BackButton>

        <S.HeaderRow align="center" gap={8}>
          <S.PageTitle level={4}>{pageTitle}</S.PageTitle>
          {group.isSystem ? <ConversationGroupSystemBadge /> : null}
        </S.HeaderRow>
      </S.PageHeader>

      <S.ScrollRegion>
        <S.FormSection>
          <Form
            form={form}
            layout="vertical"
            onFinish={() => void handleSave()}
          >
            <GroupFormFields
              groups={store.groups}
              editingGroupId={group.id}
              disabled={isReadOnly}
            />
          </Form>
        </S.FormSection>

        {isReadOnly ? null : (
          <S.FooterActions vertical gap={8}>
            <Button
              type="primary"
              block
              loading={store.saveLoading}
              data-qa="settings-mobile-group-save"
              onClick={() => void handleSave()}
            >
              {t("groups.saveChanges")}
            </Button>
            <Popconfirm
              title={t("groups.deleteConfirmTitle")}
              okText={t("groups.delete")}
              okButtonProps={{
                danger: true,
                loading: store.deleteLoadingId === group.id,
              }}
              onConfirm={() => void handleDelete()}
            >
              <Button
                danger
                block
                loading={store.deleteLoadingId === group.id}
                data-qa="settings-mobile-group-delete"
                aria-label={t("groups.mobile.deleteAria")}
              >
                {t("groups.delete")}
              </Button>
            </Popconfirm>
          </S.FooterActions>
        )}
      </S.ScrollRegion>
    </S.Root>
  );
});
