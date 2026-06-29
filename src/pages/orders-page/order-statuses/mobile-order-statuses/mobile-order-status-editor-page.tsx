import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Alert, Button, Form } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { CenteredSpinner } from "@/components/loading/centered-spinner";

import { OrderStatusFormFields } from "../order-status-form-fields";
import { useOrderStatusEditor } from "../use-order-status-editor";
import * as S from "./mobile-order-status-editor-page.styled";

export const MobileOrderStatusEditorPage = observer(() => {
  const { t } = useTranslation();
  const { statusId } = useParams<{ statusId: string }>();
  const {
    status,
    form,
    store,
    isInvalidId,
    isLoading,
    isNotFound,
    handleSave,
    navigateToStatuses,
  } = useOrderStatusEditor(statusId);

  if (isInvalidId) {
    return (
      <S.Root>
        <S.StateContainer>
          <Alert
            type="error"
            title={t("orderStatuses.invalidStatus")}
            showIcon
          />
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
            title={t("orderStatuses.notFoundTitle")}
            description={t("orderStatuses.notFoundDescription")}
            showIcon
            action={
              <Button size="small" onClick={navigateToStatuses}>
                {t("orderStatuses.backToStatuses")}
              </Button>
            }
          />
        </S.StateContainer>
      </S.Root>
    );
  }

  if (!status) {
    return null;
  }

  const pageTitle = status.name.trim();

  return (
    <S.Root>
      <S.PageHeader>
        <S.BackButton
          type="text"
          icon={<ArrowLeftIcon size={16} />}
          aria-label={t("orderStatuses.mobile.backToStatusesAria")}
          data-qa="orders-mobile-status-back"
          onClick={navigateToStatuses}
        >
          {t("orderStatuses.backToStatuses")}
        </S.BackButton>

        <S.HeaderRow align="center" gap={8}>
          <S.ColorDot $color={status.color} aria-hidden="true" />
          <S.PageTitle level={4}>{pageTitle}</S.PageTitle>
        </S.HeaderRow>
      </S.PageHeader>

      <S.ScrollRegion>
        <S.FormSection>
          <Form
            form={form}
            layout="vertical"
            onFinish={() => void handleSave()}
          >
            <OrderStatusFormFields
              statuses={store.statuses}
              editingStatusId={status.id}
            />
          </Form>
        </S.FormSection>

        <S.FooterActions>
          <Button
            type="primary"
            block
            loading={store.statusSaveLoading}
            data-qa="orders-mobile-status-save"
            onClick={() => void handleSave()}
          >
            {t("orderStatuses.saveChanges")}
          </Button>
        </S.FooterActions>
      </S.ScrollRegion>
    </S.Root>
  );
});
