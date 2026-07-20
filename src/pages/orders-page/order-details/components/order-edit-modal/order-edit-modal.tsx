import { Button, Form, Modal } from "antd";
import { observer } from "mobx-react-lite";

import { OrderEditItemsSection } from "./__components/order-edit-items-section";
import { OrderEditNotesSection } from "./__components/order-edit-notes-section";
import { useOrderEditModal } from "./hooks/use-order-edit-modal";
import type {
  OrderEditModalProps,
  OrderEditModalSessionProps,
} from "./order-edit-modal.types";
import * as S from "./order-edit-modal.styled";

export type { OrderEditMode } from "./order-edit-modal.types";

const OrderEditModalSession = observer((props: OrderEditModalSessionProps) => {
  const {
    t,
    form,
    saving,
    lines,
    productSearchOpen,
    canEditItems,
    editItemsAllowed,
    hasUnpatchableLines,
    selectedVariantIds,
    initialFormValues,
    catalogSearch,
    modalTitle,
    handleProductSearchOpenChange,
    handleVariantSelect,
    updateLine,
    removeLine,
    handleCancel,
    handleSave,
  } = useOrderEditModal(props);

  const { order, mode } = props;

  return (
    <Modal
      width={860}
      open
      title={modalTitle}
      destroyOnHidden
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" disabled={saving} onClick={handleCancel}>
          {t("orders.details.cancel")}
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={saving}
          onClick={() => void handleSave()}
        >
          {t("orders.details.save")}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        disabled={saving}
        initialValues={initialFormValues}
      >
        <S.EditModalStack>
          {mode === "items" && (
            <OrderEditItemsSection
              order={order}
              t={t}
              form={form}
              canEditItems={canEditItems}
              editItemsAllowed={editItemsAllowed}
              lines={lines}
              hasUnpatchableLines={hasUnpatchableLines}
              productSearchOpen={productSearchOpen}
              catalogSearch={catalogSearch}
              selectedVariantIds={selectedVariantIds}
              onProductSearchOpenChange={handleProductSearchOpenChange}
              onVariantSelect={handleVariantSelect}
              onUpdateLine={updateLine}
              onRemoveLine={removeLine}
            />
          )}

          <OrderEditNotesSection t={t} />
        </S.EditModalStack>
      </Form>
    </Modal>
  );
});

export const OrderEditModal = observer(
  ({ open, order, mode, onClose, onUpdateOrder }: OrderEditModalProps) => {
    if (!open) {
      return null;
    }

    return (
      <OrderEditModalSession
        key={`${order.id}-${mode}-${order.updatedAt}`}
        order={order}
        mode={mode}
        onClose={onClose}
        onUpdateOrder={onUpdateOrder}
      />
    );
  },
);
