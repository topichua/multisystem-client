import {
  CaretLeftIcon,
  CaretRightIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import { Button, Flex } from "antd";
import { useTranslation } from "react-i18next";

import * as S from "../../settings-integrations.styled";

type WizardFooterProps = {
  currentStep: number;
  discoverLoading: boolean;
  submitting: boolean;
  onBack: () => void;
  onCancel: () => void;
  onPrimaryAction: () => void;
};

export function WizardFooter({
  currentStep,
  discoverLoading,
  submitting,
  onBack,
  onCancel,
  onPrimaryAction,
}: WizardFooterProps) {
  const { t } = useTranslation();

  return (
    <S.NovaPoshtaWizardFooter>
      {currentStep === 0 ? (
        <Button disabled={discoverLoading || submitting} onClick={onCancel}>
          {t("integrations.novaPoshtaWizard.actions.cancel")}
        </Button>
      ) : (
        <Button
          icon={<CaretLeftIcon />}
          disabled={discoverLoading || submitting}
          onClick={onBack}
        >
          {t("integrations.novaPoshtaWizard.actions.back")}
        </Button>
      )}

      <Button
        type="primary"
        loading={currentStep === 0 ? discoverLoading : submitting}
        icon={currentStep === 2 ? <CheckIcon /> : undefined}
        onClick={onPrimaryAction}
      >
        <Flex align="center" gap={6}>
          {currentStep === 2
            ? t("integrations.novaPoshtaWizard.actions.finish")
            : t("integrations.novaPoshtaWizard.actions.next")}
          {currentStep !== 2 ? <CaretRightIcon /> : null}
        </Flex>
      </Button>
    </S.NovaPoshtaWizardFooter>
  );
}
