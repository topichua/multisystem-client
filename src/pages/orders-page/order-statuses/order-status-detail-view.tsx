import { Alert, Button, Flex, Form, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import * as S from "@/components/layout/form-card.styled";
import { formatOrderStatusName } from "@/features/orders/utils/format-order-status-name";

import { OrderStatusFormFields } from "./order-status-form-fields";
import { useOrderStatusEditor } from "./use-order-status-editor";

const { Title, Text } = Typography;

export const OrderStatusDetailView = observer(() => {
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
      <Alert type="error" title={t("orderStatuses.invalidStatus")} showIcon />
    );
  }

  if (isLoading) {
    return <CenteredSpinner />;
  }

  if (isNotFound) {
    return (
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
    );
  }

  if (!status) {
    return null;
  }

  return (
    <PaneDetailLayout.Root inset data-qa="layout-order-status-detail">
      <PaneDetailLayout.Header data-qa="layout-order-status-detail-header">
        <Flex justify="space-between" align="flex-start" gap={16} wrap="wrap">
          <Flex vertical gap={4}>
            <Title level={4} style={{ margin: 0 }}>
              {formatOrderStatusName(
                status.name,
                status.isDefault,
                t("orderStatuses.defaultLabel"),
              )}
            </Title>
            <Text type="secondary">{t("orderStatuses.editHint")}</Text>
          </Flex>
          <Button
            type="primary"
            loading={store.statusSaveLoading}
            onClick={() => void handleSave()}
            style={{ flexShrink: 0 }}
          >
            {t("orderStatuses.saveChanges")}
          </Button>
        </Flex>
      </PaneDetailLayout.Header>
      <PaneDetailLayout.Body data-qa="layout-order-status-detail-body">
        <S.FormCard>
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <OrderStatusFormFields
              statuses={store.statuses}
              editingStatusId={status.id}
            />
          </Form>
        </S.FormCard>
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
});
