import { CheckIcon, TrashIcon } from "@phosphor-icons/react";
import { Button, Flex, Modal, Popconfirm, Typography } from "antd";
import { Trans } from "react-i18next";

import { useIsMobileViewport } from "@/utils/use-media-query";

import { StockSupplySelectedSection } from "./__components/stock-supply-selected-section";
import { StockSupplyVariantsPicker } from "./__components/stock-supply-variants-picker";
import { useStockSupplyModal } from "./hooks/use-stock-supply-modal";
import type { StockSupplyModalProps } from "./stock-supply-modal.types";
import * as S from "./stock-supply-modal.styled";
import { formatAmount } from "./stock-supply-modal.utils";

const { Text, Title } = Typography;

export const StockSupplyModal = ({
  open,
  supplyId = null,
  onClose,
  onSuccess,
}: StockSupplyModalProps) => {
  const isMobileViewport = useIsMobileViewport();
  const {
    t,
    isEditMode,
    categoriesStore,
    variantsLoading,
    variantsLoadingMore,
    loadError,
    submitError,
    submitting,
    submittingAction,
    selectedLines,
    name,
    comment,
    immediatelyApply,
    search,
    pickerMode,
    selectedCategoryId,
    filteredAvailableVariants,
    groupedAvailableVariants,
    selectedQuantity,
    selectedTotal,
    summaryCurrency,
    canSubmit,
    setName,
    setComment,
    setImmediatelyApply,
    setSearch,
    setPickerMode,
    handleAfterOpenChange,
    handleClose,
    handleCreate,
    handleSave,
    handleApply,
    handleDelete,
    handleCategoryChange,
    loadMoreVariants,
    addVariant,
    addAllVisibleVariants,
    clearSelectedLines,
    removeLine,
    updateLine,
  } = useStockSupplyModal({ supplyId, onClose, onSuccess });

  const title = isEditMode
    ? t("products.stockSupply.editTitle")
    : t("products.stockSupply.title");
  const description = isEditMode
    ? name.trim()
      ? t("products.stockSupply.editDescriptionNamed", { name: name.trim() })
      : t("products.stockSupply.editDescription")
    : t("products.stockSupply.description");

  const isActionBusy = (action: typeof submittingAction) =>
    submitting && submittingAction !== action;

  const footer = (
    <Flex align="center" justify="space-between" gap={16} wrap="wrap">
      <Text type="secondary">
        <Trans
          i18nKey="products.stockSupply.summary"
          values={{
            count: selectedLines.length,
            quantity: selectedQuantity,
            amount: formatAmount(selectedTotal, summaryCurrency),
          }}
          components={{
            value: <Text strong />,
          }}
        />
      </Text>
      <Flex gap={8} justify="flex-end" style={{ marginLeft: "auto" }}>
        {isEditMode && (
          <Popconfirm
            title={t("products.stockSupply.deleteConfirm")}
            description={t("products.stockSupply.deleteWarning")}
            okText={t("products.stockSupply.delete")}
            okButtonProps={{ danger: true }}
            disabled={submitting}
            onConfirm={() => void handleDelete()}
          >
            <Button
              danger
              icon={<TrashIcon size={16} />}
              loading={submittingAction === "delete"}
              disabled={isActionBusy("delete")}
              data-qa="stock-supply-delete"
            >
              {t("products.stockSupply.delete")}
            </Button>
          </Popconfirm>
        )}
        <Button onClick={handleClose} disabled={submitting}>
          {t("products.stockSupply.cancel")}
        </Button>
        {isEditMode ? (
          <>
            <Button
              type="text"
              loading={submittingAction === "save"}
              disabled={!canSubmit || isActionBusy("save")}
              onClick={() => void handleSave()}
            >
              {t("products.stockSupply.save")}
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon size={16} />}
              loading={submittingAction === "apply"}
              disabled={!canSubmit || isActionBusy("apply")}
              onClick={() => void handleApply()}
            >
              {t("products.stockSupply.apply")}
            </Button>
          </>
        ) : (
          <Button
            type="primary"
            icon={<CheckIcon size={16} />}
            loading={submittingAction === "create"}
            disabled={!canSubmit || isActionBusy("create")}
            onClick={() => void handleCreate()}
          >
            {t("products.stockSupply.submit")}
          </Button>
        )}
      </Flex>
    </Flex>
  );

  return (
    <Modal
      open={open}
      title={
        <Flex vertical gap={4}>
          <Title level={4} style={{ margin: 0 }}>
            {title}
          </Title>
          <Text type="secondary">{description}</Text>
        </Flex>
      }
      width={isMobileViewport ? "calc(100vw - 24px)" : 1120}
      centered
      destroyOnHidden
      afterOpenChange={handleAfterOpenChange}
      onCancel={handleClose}
      footer={footer}
      styles={{
        body: { padding: 0 },
        footer: {
          paddingTop: 16,
          marginTop: 0,
          borderTop: "1px solid #eff0f4",
        },
      }}
      data-qa="stock-supply-modal"
    >
      <S.ModalBody>
        <StockSupplySelectedSection
          t={t}
          selectedLines={selectedLines}
          name={name}
          comment={comment}
          immediatelyApply={immediatelyApply}
          showImmediatelyApply={!isEditMode}
          submitError={submitError}
          onNameChange={setName}
          onCommentChange={setComment}
          onImmediatelyApplyChange={setImmediatelyApply}
          onClear={clearSelectedLines}
          onUpdateLine={updateLine}
          onRemoveLine={removeLine}
        />
        <StockSupplyVariantsPicker
          t={t}
          categoriesStore={categoriesStore}
          loadError={loadError}
          search={search}
          pickerMode={pickerMode}
          selectedCategoryId={selectedCategoryId}
          filteredAvailableVariants={filteredAvailableVariants}
          groupedAvailableVariants={groupedAvailableVariants}
          variantsLoading={variantsLoading}
          variantsLoadingMore={variantsLoadingMore}
          onSearchChange={setSearch}
          onPickerModeChange={setPickerMode}
          onCategoryChange={handleCategoryChange}
          onLoadMore={loadMoreVariants}
          onAddAll={addAllVisibleVariants}
          onAddVariant={addVariant}
        />
      </S.ModalBody>
    </Modal>
  );
};
