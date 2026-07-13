import { CheckIcon } from "@phosphor-icons/react";
import { Button, Flex, Modal, Typography } from "antd";

import { useIsMobileViewport } from "@/utils/use-media-query";

import { StockSupplySelectedSection } from "./__components/stock-supply-selected-section";
import { StockSupplyVariantsPicker } from "./__components/stock-supply-variants-picker";
import { useStockSupplyModal } from "./hooks/use-stock-supply-modal";
import type { StockSupplyModalProps } from "./stock-supply-modal.types";
import * as S from "./stock-supply-modal.styled";
import { formatAmount } from "./stock-supply-modal.utils";

const { Text, Title } = Typography;

export function StockSupplyModal({
  open,
  onClose,
  onSuccess,
}: StockSupplyModalProps) {
  const isMobileViewport = useIsMobileViewport();
  const {
    t,
    categoriesStore,
    variantsLoading,
    loadError,
    submitError,
    submitting,
    selectedLines,
    comment,
    search,
    pickerMode,
    categoryOptions,
    filteredAvailableVariants,
    groupedAvailableVariants,
    selectedQuantity,
    selectedTotal,
    summaryCurrency,
    canSubmit,
    categorySelectValue,
    setComment,
    setSearch,
    setPickerMode,
    handleAfterOpenChange,
    handleClose,
    handleSubmit,
    handleCategoryChange,
    addVariant,
    addAllVisibleVariants,
    clearSelectedLines,
    removeLine,
    updateLine,
  } = useStockSupplyModal({ onClose, onSuccess });

  return (
    <Modal
      open={open}
      title={
        <Flex vertical gap={4}>
          <Title level={4} style={{ margin: 0 }}>
            {t("products.stockSupply.title")}
          </Title>
          <Text type="secondary">{t("products.stockSupply.description")}</Text>
        </Flex>
      }
      width={isMobileViewport ? "calc(100vw - 24px)" : 1120}
      centered
      destroyOnHidden
      afterOpenChange={handleAfterOpenChange}
      onCancel={handleClose}
      footer={
        <Flex align="center" justify="space-between" gap={16} wrap="wrap">
          <Text type="secondary">
            {t("products.stockSupply.summary", {
              count: selectedLines.length,
              quantity: selectedQuantity,
              amount: formatAmount(selectedTotal, summaryCurrency),
            })}
          </Text>
          <Flex gap={8} justify="flex-end" style={{ marginLeft: "auto" }}>
            <Button onClick={handleClose}>
              {t("products.stockSupply.cancel")}
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon size={16} />}
              loading={submitting}
              disabled={!canSubmit}
              onClick={() => void handleSubmit()}
            >
              {t("products.stockSupply.submit")}
            </Button>
          </Flex>
        </Flex>
      }
      styles={{
        body: { padding: 0 },
        footer: { marginTop: 0 },
      }}
      data-qa="stock-supply-modal"
    >
      <S.ModalBody>
        <StockSupplySelectedSection
          t={t}
          selectedLines={selectedLines}
          comment={comment}
          submitError={submitError}
          onCommentChange={setComment}
          onClear={clearSelectedLines}
          onUpdateLine={updateLine}
          onRemoveLine={removeLine}
        />
        <StockSupplyVariantsPicker
          t={t}
          categoriesStore={categoriesStore}
          variantsLoading={variantsLoading}
          loadError={loadError}
          search={search}
          pickerMode={pickerMode}
          categoryOptions={categoryOptions}
          categorySelectValue={categorySelectValue}
          filteredAvailableVariants={filteredAvailableVariants}
          groupedAvailableVariants={groupedAvailableVariants}
          onSearchChange={setSearch}
          onPickerModeChange={setPickerMode}
          onCategoryChange={handleCategoryChange}
          onAddAll={addAllVisibleVariants}
          onAddVariant={addVariant}
        />
      </S.ModalBody>
    </Modal>
  );
}
