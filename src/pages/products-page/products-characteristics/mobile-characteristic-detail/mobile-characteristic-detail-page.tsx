import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Alert, Button } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { CenteredSpinner } from "@/components/loading/centered-spinner";

import { CharacteristicArchiveModal } from "../components/characteristic-archive-modal";
import { CharacteristicDangerZone } from "../components/characteristic-danger-zone";
import { CharacteristicDetailHeader } from "../components/characteristic-detail-header";
import { CharacteristicDisplayNameField } from "../components/characteristic-display-name-field";
import { CharacteristicOptionsSection } from "../components/characteristic-options-section";
import { useProductCharacteristicDetailController } from "../controllers/use-product-characteristic-detail-controller";
import { CharacteristicTextValuesSection } from "../product-characteristic-detail-view";
import * as S from "./mobile-characteristic-detail-page.styled";

export const MobileCharacteristicDetailPage = () => {
  const { characteristicId } = useParams<{ characteristicId: string }>();

  return (
    <MobileCharacteristicDetailContent key={characteristicId ?? "missing"} />
  );
};

const MobileCharacteristicDetailContent = observer(() => {
  const { t } = useTranslation();
  const controller = useProductCharacteristicDetailController();

  if (controller.isInvalidCharacteristicId) {
    return (
      <S.Root>
        <S.StateContainer>
          <Alert type="error" title={t("characteristics.invalidId")} showIcon />
        </S.StateContainer>
      </S.Root>
    );
  }

  if (controller.isPageLoading) {
    return (
      <S.Root>
        <S.StateContainer>
          <CenteredSpinner />
        </S.StateContainer>
      </S.Root>
    );
  }

  if (controller.isDetailUnavailable) {
    return (
      <S.Root>
        <S.StateContainer>
          <Alert
            type="error"
            title={t("characteristics.detailLoadFailed")}
            description={controller.detailError}
            showIcon
            action={
              <Button
                size="small"
                onClick={controller.navigateToCharacteristics}
              >
                {t("characteristics.backToList")}
              </Button>
            }
          />
        </S.StateContainer>
      </S.Root>
    );
  }

  if (controller.isNotFound) {
    return (
      <S.Root>
        <S.StateContainer>
          <Alert
            type="warning"
            title={t("characteristics.notFoundTitle")}
            description={t("characteristics.notFoundDescription")}
            showIcon
            action={
              <Button
                size="small"
                onClick={controller.navigateToCharacteristics}
              >
                {t("characteristics.backToList")}
              </Button>
            }
          />
        </S.StateContainer>
      </S.Root>
    );
  }

  if (!controller.characteristic) {
    return null;
  }

  const characteristic = controller.characteristic;

  return (
    <S.Root>
      <S.PageHeader>
        <S.BackButton
          type="text"
          icon={<ArrowLeftIcon size={16} />}
          aria-label={t("characteristics.mobile.backToCharacteristicsAria")}
          data-qa="products-mobile-characteristic-back"
          onClick={controller.navigateToCharacteristics}
        >
          {t("characteristics.backToList")}
        </S.BackButton>
      </S.PageHeader>

      <S.ScrollRegion>
        <S.ContentSection>
          <CharacteristicDetailHeader
            characteristic={characteristic}
            totalProducts={controller.totalProducts}
            saveLoading={controller.saveLoading}
            labelEdit={controller.characteristicLabelEdit}
            editDataQa={`products-mobile-characteristic-edit-${characteristic.id}`}
          />

          <CharacteristicDisplayNameField
            value={controller.displayNameEdit.value}
            placeholder={characteristic.label}
            loading={controller.saveLoading}
            onChange={controller.displayNameEdit.onChange}
            onBlur={() => void controller.displayNameEdit.onSave()}
          />

          {characteristic.type === "options" ? (
            <S.SectionCard>
              <CharacteristicOptionsSection
                options={controller.options}
                create={controller.optionCreate}
                rename={controller.optionRename}
                saveLoading={controller.saveLoading}
                optionArchiveLoadingId={controller.optionArchiveLoadingId}
                optionDeleteLoadingId={controller.optionDeleteLoadingId}
                onArchiveOption={controller.onRequestArchiveOption}
                onUnarchiveOption={controller.onUnarchiveOption}
                onDeleteOption={controller.onDeleteOption}
                addOptionDataQa={`products-mobile-characteristic-add-option-${characteristic.id}`}
                getOptionItemDataQa={(optionId) =>
                  `products-mobile-characteristic-option-${optionId}`
                }
              />
            </S.SectionCard>
          ) : (
            <S.SectionCard>
              <CharacteristicTextValuesSection
                rows={controller.topTextValues}
                totalProducts={controller.totalProducts}
              />
            </S.SectionCard>
          )}

          <S.FooterActions vertical gap={8}>
            <CharacteristicDangerZone
              isArchived={controller.isArchived}
              archiveLoading={controller.archiveLoadingId === characteristic.id}
              deleteLoading={controller.deleteLoadingId === characteristic.id}
              onArchive={controller.onRequestArchiveCharacteristic}
              onUnarchive={controller.onUnarchiveCharacteristic}
              onDelete={controller.onDeleteCharacteristic}
              archiveDataQa={`products-mobile-characteristic-archive-${characteristic.id}`}
              deleteDataQa={`products-mobile-characteristic-delete-${characteristic.id}`}
              mobileLayout
            />
          </S.FooterActions>
        </S.ContentSection>
      </S.ScrollRegion>

      <CharacteristicArchiveModal
        open={controller.archiveModalOpen}
        target={controller.archiveModalTarget}
        loading={controller.archiveModalLoading}
        onCancel={controller.onCloseArchiveModal}
        onConfirm={controller.onConfirmArchive}
      />
    </S.Root>
  );
});
