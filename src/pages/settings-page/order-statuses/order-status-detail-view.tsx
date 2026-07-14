import { Alert, Button, Flex, Form, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import { FormCard } from "@/components/layout/form-card";

import { OrderStatusFormFields } from "./order-status-form-fields";
import { OrderStatusSystemBadge } from "./order-status-system-badge";
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
    handleDelete,
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
            <Flex align="center" gap={8} wrap="wrap">
              <Title level={4} style={{ margin: 0 }}>
                {status.name}
              </Title>
              {status.isSystem ? <OrderStatusSystemBadge /> : null}
            </Flex>
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
        <FormCard>
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <OrderStatusFormFields
              statuses={store.statuses}
              editingStatusId={status.id}
              isSystem={status.isSystem}
              deleteLoading={store.statusDeleteLoading}
              onDelete={handleDelete}
              deleteDataQa={`order-status-delete-${status.id}`}
            />
          </Form>
        </FormCard>
      </PaneDetailLayout.Body>
    </PaneDetailLayout.Root>
  );
});
